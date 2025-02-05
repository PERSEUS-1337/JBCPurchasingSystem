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

describe("Mongoose Model Validation: User", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases", () => {
    it("should save user with VALID fields", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
    });

    it("should default DATECREATED to now()", async () => {
      const user = new User(validUser);
      const savedUser: IUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should successfully HASH password", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.password).not.toBe(validUser.password);
      expect(await bcrypt.compare(validUser.password, savedUser.password)).toBe(
        true
      );
    });

    it("should successfully COMPARE passwords", async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword(validUser.password);
      expect(isMatch).toBe(true);

      const isNotMatch = await savedUser.comparePassword(wrongOldPassword);
      expect(isNotMatch).toBe(false);
    });

    it("should skip HASH if password is unmodified", async () => {
      const user = new User(validUser);
      await user.save();

      const hashedPassword = user.password;

      user.fullname = "Johnathan Doe";
      await user.save();

      expect(user.password).toBe(hashedPassword);
    });
  });

  describe("Fail Cases", () => {
    it("should require REQUIRED fields", async () => {
      const user = new User({});
      await expect(user.validate()).rejects.toThrow();
    });

    it("should reject INVALID status", async () => {
      const user = new User(invalidStatusUser);
      await expect(user.save()).rejects.toThrow();
    });

    it("should reject PASSWORD HASH errors", async () => {
      jest.spyOn(bcrypt, "genSalt").mockImplementationOnce(() => {
        throw new Error("Salt generation failed");
      });

      const user = new User(validUser);
      await expect(user.save()).rejects.toThrow("Salt generation failed");

      jest.restoreAllMocks();
    });
  });
});

