import bcrypt from "bcrypt";
import User, { IUser } from "../../src/models/userModel";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { connectDB, disconnectDB, dropDB } from "../setup/globalSetupHelper";
import { invalidStatusUser, validUser } from "../setup/mockUsers";
import { wrongOldPassword } from "../setup/mockData";

describe("User Model Validation", () => {
  beforeAll(async () => {
    await connectDB(); 
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: User Creation and Validation", () => {
    it("should save a user with valid fields", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
    });

    it("should set the default 'createdAt' field to the current timestamp", async () => {
      const user = new User(validUser);
      const savedUser: IUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should hash the password before saving the user", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.password).not.toBe(validUser.password); // Ensure password is hashed
      expect(await bcrypt.compare(validUser.password, savedUser.password)).toBe(
        true
      ); // Verify hash
    });

    it("should correctly compare a plaintext password with the hashed password", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword(validUser.password);
      expect(isMatch).toBe(true); // Correct password should match

      const isNotMatch = await savedUser.comparePassword(wrongOldPassword);
      expect(isNotMatch).toBe(false); // Incorrect password should not match
    });

    it("should not rehash the password if it is not modified", async () => {
      const user = new User(validUser);
      await user.save();

      const hashedPassword = user.password;

      user.fullname = "Johnathan Doe"; // Modify a non-password field
      await user.save();

      expect(user.password).toBe(hashedPassword); // Password should remain unchanged
    });
  });

  describe("Fail Cases: User Validation and Error Handling", () => {
    it("should reject user creation if required fields are missing", async () => {
      const user = new User({});
      await expect(user.validate()).rejects.toThrow(); // Validation should fail
    });

    it("should reject user creation if the status field is invalid", async () => {
      const user = new User(invalidStatusUser);
      await expect(user.save()).rejects.toThrow(); // Invalid status should fail
    });

    it("should throw an error if password hashing fails", async () => {
      jest.spyOn(bcrypt, "genSalt").mockImplementationOnce(() => {
        throw new Error("Salt generation failed");
      });

      const user = new User(validUser);
      await expect(user.save()).rejects.toThrow("Salt generation failed");

      jest.restoreAllMocks(); // Restore the original implementation
    });
  });
});
