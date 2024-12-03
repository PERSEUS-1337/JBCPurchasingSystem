import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
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

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start the MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // This syntax ensures that we are safely coding within typescript, making sure that it exists first before anything else
  const db = mongoose.connection.db;
  if (db) {
    const collections = await db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Mongoose Model Validation: User", () => {
  it("should require required fields", async () => {
    const user = new User({}); // Missing required fields
    await expect(user.validate()).rejects.toThrow(); // Rejects the user since it has missing details
  });

  it("should save a user with valid fields", async () => {
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

  it("should set default dateCreated to now", async () => {
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

  it("should hash the password before saving", async () => {
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

  it("should handle errors during password hashing", async () => {
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

  it("should correctly compare passwords", async () => {
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

  it("should skip password hashing if the password is not modified", async () => {
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

  it("should reject invalid status", async () => {
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
