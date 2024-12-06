import request, { Response } from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  jest,
} from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../src/models/userModel";
import {
  validUser,
  noUsernameUser,
  noPasswordUser,
  weakPasswordUser,
  unexpectedUser,
} from "./mockUsers";
import app from "../../src/app";

describe("Authentication Routes", () => {
  const apiRegister = "/api/auth/register";
  const apiLogin = "/api/auth/login";

  const mockToken = "mock-jwt-token";

  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe(`POST ${apiRegister}`, () => {
    beforeEach(async () => {
      // Reset db before each test
      await User.deleteMany({});
    });

    const regSuccessMsg = "User registered successfully";
    const userExistsMsg = "Username already exists";
    const validationFailedMsg = "Validation failed";

    it("should register a user successfully", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: regSuccessMsg,
          username: validUser.username,
        })
      );
    });

    it("should not register a user with an existing username", async () => {
      await new User(validUser).save(); // Pre-save user without actually going through the route.

      const response: Response = await request(app)
        .post(apiRegister)
        .send(validUser); // Try registering the same user.

      expect(response.status).toBe(409); // Conflict status code.
      expect(response.body.message).toBe(userExistsMsg);
    });

    it("should return an error if the username is missing", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(noUsernameUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toEqual(
        expect.objectContaining({
          message: validationFailedMsg, // Ensure it matches the expected error type
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: "username", // The path is empty for unexpected fields
              message: expect.stringContaining("Required"), // Specific error message
            }),
          ]),
        })
      );
    });

    it("should return an error if the password is missing", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(noPasswordUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toEqual(
        expect.objectContaining({
          message: validationFailedMsg, // Ensure it matches the expected error type
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: "password", // The path is empty for unexpected fields
              message: expect.stringContaining("Required"), // Specific error message
            }),
          ]),
        })
      );
    });

    it("should return an error if the password is too weak", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(weakPasswordUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toEqual(
        expect.objectContaining({
          message: validationFailedMsg, // Ensure it matches the expected error type
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: "password", // The path is empty for unexpected fields
              message: expect.stringContaining("Password must be at least"), // Specific error message
            }),
          ]),
        })
      );
    });

    it("should not allow unexpected fields in the request", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(unexpectedUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toEqual(
        expect.objectContaining({
          message: validationFailedMsg, // Ensure it matches the expected error type
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: "", // The path is empty for unexpected fields
              message: expect.stringContaining("Unrecognized key(s) in object"), // Specific error message
            }),
          ]),
        })
      );
    });

    it("should return a 500 error for an unexpected error during registration", async () => {
      // Mock a database error or any other unexpected error
      jest
        .spyOn(User.prototype, "save")
        .mockRejectedValueOnce(new Error("Database error"));

      const response: Response = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(response.status).toBe(500); // Internal server error
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe(`POST ${apiLogin}`, () => {
    const loginSuccessMsg = "Login successful";
    const invalidEmailUser = {
      email: "invalid@example.com",
      password: "password123",
    };
    const invalidPasswordUser = {
      email: validUser.email,
      password: "wrongpassword",
    };
    const validLoginData = {
      email: validUser.email,
      password: validUser.password,
    };

    beforeEach(async () => {
      await User.deleteMany({}); // Clear any existing data
      await new User(validUser).save(); // Pre-save the valid user for login tests
    });

    it("should login a user successfully", async () => {
      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: loginSuccessMsg,
          token: expect.any(String), // Validate that a token is returned
        })
      );
    });

    it("should return an error if the email is invalid", async () => {
      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(invalidEmailUser);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User does not exist.");
    });

    it("should return an error if the password is incorrect", async () => {
      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(invalidPasswordUser);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials.");
    });

    it("should return an error if email format is invalid", async () => {
      const invalidEmailFormat = {
        email: "invalid-email",
        password: "password123",
      };

      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(invalidEmailFormat);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "email",
            message: "Invalid email format",
          }),
        ])
      );
    });

    it("should return an error if password is too short", async () => {
      const shortPasswordUser = { email: validUser.email, password: "short" };

      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(shortPasswordUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: "Password must be at least 8 characters long",
          }),
        ])
      );
    });
    it("should return a 500 error for an unexpected error during login", async () => {
      // Mock a database error or any other unexpected error
      jest
        .spyOn(User, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response: Response = await request(app)
        .post("/api/auth/login")
        .send(validLoginData);

      expect(response.status).toBe(500); // Internal server error
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout a user successfully", async () => {
      const response: Response = await request(app)
        .post("/api/auth/logout")
        .send({ token: mockToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });
  });

  describe("GET /api/auth/refresh", () => {
    it("should refresh a user token", async () => {
      const response: Response = await request(app).get("/api/auth/refresh");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Token refreshed");
      expect(response.body.token).toBe("new-mock-jwt-token");
    });
  });
});
