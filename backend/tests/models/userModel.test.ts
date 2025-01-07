import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../../src/models/userModel";
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

  it("require REQUIRED fields", async () => {
    const user = new User({}); // Missing required fields
    await expect(user.validate()).rejects.toThrow(); // Rejects the user since it has missing details
  });

  it("save user with VALID fields", async () => {
    const user = new User({
      userID: "U123",
      fullname: "John Doe",
      idNumber: "12345",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "hashedpassword",
      role: "Admin",
      position: "Manager",
      department: "HR",
      status: "Active",
    });

    const savedUser = await user.save(); // Save the user by inserting it to db
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe("johndoe@example.com");
  });

  it("default DATECREATED to now()", async () => {
    const user = new User({
      userID: "U456",
      fullname: "Jane Doe",
      idNumber: "67890",
      username: "janedoe",
      email: "janedoe@example.com",
      password: "hashedpassword",
      role: "User",
      position: "Engineer",
      department: "IT",
      status: "Active",
    });
    const savedUser = await user.save();
    expect(savedUser.dateCreated).toBeDefined(); // We ensure that date exists first
    expect(savedUser.dateCreated.getTime()).toBeLessThanOrEqual(Date.now()); // We compare the date created to the latest date available
  });

  it("successfully HASH password", async () => {
    const user = new User({
      userID: "U123",
      fullname: "John Doe",
      idNumber: "12345",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "plaintextpassword",
      role: "Admin",
      position: "Manager",
      department: "HR",
      status: "Active",
    });

    await user.save();

    expect(user._id).toBeDefined();
    expect(user.password).not.toBe("plaintextpassword"); // Password should be hashed
    expect(await bcrypt.compare("plaintextpassword", user.password)).toBe(true); // Check if the hash matches
  });

  it("reject PASSWORD HASH errors", async () => {
    // Mock bcrypt.genSalt to throw an error
    jest.spyOn(bcrypt, "genSalt").mockImplementationOnce(() => {
      throw new Error("Salt generation failed");
    });

    const user = new User({
      userID: "U123",
      fullname: "John Doe",
      idNumber: "12345",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "plaintextpassword",
      role: "Admin",
      position: "Manager",
      department: "HR",
      status: "Active",
    });

    await expect(user.save()).rejects.toThrow("Salt generation failed");

    // Restore the original implementation of bcrypt.genSalt
    jest.restoreAllMocks();
  });

  it("successfully COMPARE passwords", async () => {
    const user = new User({
      userID: "U123",
      fullname: "John Doe",
      idNumber: "12345",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "plaintextpassword",
      role: "Admin",
      position: "Manager",
      department: "HR",
      status: "Active",
    });

    await user.save();

    // Test the comparePassword method
    const isMatch = await user.comparePassword("plaintextpassword");
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword("wrongpassword");
    expect(isNotMatch).toBe(false);
  });

  it("skip HASH if password is unmodified", async () => {
    const user = new User({
      userID: "U123",
      fullname: "John Doe",
      idNumber: "12345",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "plaintextpassword",
      role: "Admin",
      position: "Manager",
      department: "HR",
      status: "Active",
    });

    await user.save();

    // Capture the hashed password
    const hashedPassword = user.password;

    // Update other fields without modifying the password
    user.fullname = "Johnathan Doe";
    await user.save();

    // Ensure the password remains unchanged
    expect(user.password).toBe(hashedPassword);
  });

  it("reject INVALID status", async () => {
    const user = new User({
      userID: "U456",
      fullname: "Jane Doe",
      idNumber: "67890",
      username: "janedoe",
      email: "janedoe@example.com",
      password: "hashedpassword",
      role: "User",
      position: "Engineer",
      department: "IT",
      status: "invalidStatus",
    });
    await expect(user.save()).rejects.toThrow(); // Expects the save to throw an error, as defined by the enums in the model
  });
});
