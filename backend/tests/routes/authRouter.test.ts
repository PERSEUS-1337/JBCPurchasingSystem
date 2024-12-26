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
  validLoginData,
  invalidEmailUser,
  invalidPasswordUser,
} from "../mockUsers";
import app from "../../src/app";
import { generateJWT } from "../../src/utils/authUtils";
import {
  apiAuthHello,
  apiChangePassword,
  apiLogin,
  apiLogout,
  apiProtected,
  apiRegister,
} from "../refRoutes";
import { writeHeapSnapshot } from "v8";

describe("Authentication Routes", () => {
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

    it("should register a user successfully", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "User registered successfully",
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
      expect(response.body.message).toBe("Username or email already exists");
    });

    it("should return an error if the username is missing", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(noUsernameUser);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Validation failed", // Ensure it matches the expected error type
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
          message: "Validation failed", // Ensure it matches the expected error type
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
          message: "Validation failed", // Ensure it matches the expected error type
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
          message: "Validation failed", // Ensure it matches the expected error type
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
        .mockRejectedValueOnce(new Error("Unexpected error"));

      const response: Response = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(response.status).toBe(500); // Internal server error
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe(`POST ${apiLogin}`, () => {
    beforeEach(async () => {
      await User.deleteMany({}); // Clear any existing data
      await new User(validUser).save(); // Pre-save the valid user for login tests
    });

    it("should login a user successfully", async () => {
      const response: Response = await request(app)
        .post(apiLogin)
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Login successful",
          bearer: expect.any(String), // Validate that a token is returned
        })
      );
    });

    it("should return an error if the email is invalid", async () => {
      const response: Response = await request(app)
        .post(apiLogin)
        .send(invalidEmailUser);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User does not exist.");
    });

    it("should return an error if the password is incorrect", async () => {
      const response: Response = await request(app)
        .post(apiLogin)
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
        .post(apiLogin)
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
        .post(apiLogin)
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
        .post(apiLogin)
        .send(validLoginData);

      expect(response.status).toBe(500); // Internal server error
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe(`POST ${apiLogout}`, () => {
    it("should logout a user successfully", async () => {
      const response: Response = await request(app)
        .post("/api/auth/logout")
        .send({ token: "mock-jwt-token" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });
  });

  describe(`POST ${apiChangePassword}`, () => {
    let validToken: string;
    const invalidToken = "invalid-token";
    const wrongOldPassword = "WrongOldPassword123";
    const newPassword = "NewPassword123!";

    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });

    it("should change the password successfully for authenticated users", async () => {
      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          currentPassword: validUser.password,
          newPassword: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password changed successfully");

      // Verify that the new password works
      const loginResponse: Response = await request(app).post(apiLogin).send({
        email: validUser.email,
        password: "NewPassword123!",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("Login successful");
    });

    it("should return an error if the old password is incorrect", async () => {
      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          currentPassword: wrongOldPassword,
          newPassword: newPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Current password is incorrect");
    });

    it("should return an error if the user is not authenticated", async () => {
      const response: Response = await request(app)
        .post(apiChangePassword)
        .send({
          currentPassword: validUser.password,
          newPassword: newPassword,
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied, no token provided");
    });

    it("should return an error if the token is invalid", async () => {
      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${invalidToken}`)
        .send({
          currentPassword: validUser.password,
          newPassword: newPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return an error if the user is not found", async () => {
      await User.deleteMany({}); // Simulate no users in the database

      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          currentPassword: validUser.password,
          newPassword: newPassword,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return a 500 error for unexpected server issues", async () => {
      jest
        .spyOn(User.prototype, "save")
        .mockRejectedValueOnce(new Error("Unexpected error"));

      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          currentPassword: validUser.password,
          newPassword: newPassword,
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
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

  describe(`GET ${apiProtected}`, () => {
    let validToken: string;
    const invalidToken: string = "invalid-token";
    const expiredToken: string =
      "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NzUyYTEwZWRjZWExMGQwNjlhNTU5ZGYiLCJpYXQiOjE3MzM4MTU4NDgsImV4cCI6MTczMzgxNjE0OH0.uTFHWMoVXIlV3ERhnLVFEZzfHCVeA77snM8B4KzwCps";

    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });

    it("should access the protected route successfully with a valid JWT", async () => {
      const response: Response = await request(app)
        .get(apiProtected)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the auth protected route");
    });

    it("should return an error if no token is provided", async () => {
      const response: Response = await request(app).get(apiProtected);

      expect(response.status).toBe(403); // Forbidden
      expect(response.body.message).toBe("Access denied, no token provided");
    });

    it("should return an error if the token is invalid", async () => {
      const response: Response = await request(app)
        .get(apiProtected)
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return an error if the token is expired", async () => {
      const response: Response = await request(app)
        .get(apiProtected)
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body.message).toBe("Invalid or expired token");
    });
  });

  describe(`GET ${apiAuthHello}`, () => {
    it("should access the public auth route to confirm that it exists", async () => {
      const response: Response = await request(app).get(apiAuthHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public auth route");
    });
  });
});
