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
import app from "../../src/app";
import User from "../../src/models/userModel";
import {
  validUser,
  noUsernameUser,
  noPasswordUser,
  weakPasswordUser,
  unexpectedUser,
  shortUsernameUser,
} from "../setup/mockUsers";
import {
  validLoginData,
  invalidEmailLoginData,
  invalidPasswordLoginData,
  nonExistentUserLoginData,
  expiredToken,
  invalidToken,
  validChangePasswordData,
  wrongOldChangePasswordData,
} from "../setup/mockData";
import {
  apiAuthHello,
  apiChangePassword,
  apiLogin,
  apiLogout,
  apiProtected,
  apiRegister,
} from "../setup/refRoutes";
import {
  connectDB,
  disconnectDB,
  preSaveUserAndGenJWT,
  preSaveValidUser,
} from "../setup/globalSetupHelper";

describe("Authentication Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`POST ${apiRegister}`, () => {
    beforeEach(async () => {
      // Reset db before each test
      await User.deleteMany({});
    });

    describe("Success Cases", () => {
      it("Registers a user successfully with valid data.", async () => {
        const response: Response = await request(app)
          .post(apiRegister)
          .send(validUser);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "User registered successfully",
            data: {
              username: validUser.username,
            },
          })
        );
      });
    });

    describe("Fail Cases", () => {
      it("Rejects registration when username is a duplicate.", async () => {
        await preSaveValidUser();

        const response: Response = await request(app)
          .post(apiRegister)
          .send(validUser); // Try registering the same user.

        expect(response.status).toBe(409); // Conflict status code.
        expect(response.body.message).toBe("Username or email already exists");
      });

      it("Rejects registration when username is missing.", async () => {
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

      it("Rejects registration when username is too short.", async () => {
        const response: Response = await request(app)
          .post(apiRegister)
          .send(shortUsernameUser);

        expect(response.status).toBe(400); // Bad Request
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Validation failed",
            errors: expect.arrayContaining([
              expect.objectContaining({
                path: "username",
                message: expect.stringContaining(
                  "Username must be at least 3 characters long"
                ),
              }),
            ]),
          })
        );
      });

      it("Rejects registration when password is missing.", async () => {
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

      it("Rejects registration when password is weak.", async () => {
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

      it("Rejects registration when unexpected fields are present.", async () => {
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
                message: expect.stringContaining(
                  "Unrecognized key(s) in object"
                ), // Specific error message
              }),
            ]),
          })
        );
      });
    });

    it("Handles unexpected errors during registration with a 500 status.", async () => {
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
    beforeAll(async () => {
      await preSaveValidUser();
    });

    describe("Success Cases", () => {
      it("Logs in successfully with valid credentials.", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(validLoginData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Login successful",
            data: { bearer: expect.any(String) },
          })
        );
      });
    });

    describe("Fail Cases", () => {
      it("Rejects login for a non-existent user.", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(nonExistentUserLoginData);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exist.");
      });

      it("Rejects login with incorrect password.", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(invalidPasswordLoginData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials.");
      });

      it("Rejects login with invalid email format.", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(invalidEmailLoginData);

        expect(response.status).toBe(400); // Bad Request
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Validation failed",
            errors: expect.arrayContaining([
              expect.objectContaining({
                path: "email",
                message: expect.stringContaining("Invalid email format"),
              }),
            ]),
          })
        );
      });

      it("Rejects login with a password that is too short.", async () => {
        const shortPasswordUser = { email: validUser.email, password: "short" };

        const response: Response = await request(app)
          .post(apiLogin)
          .send(shortPasswordUser);

        expect(response.status).toBe(400); // Bad Request
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Validation failed",
            errors: expect.arrayContaining([
              expect.objectContaining({
                path: "password",
                message: expect.stringContaining(
                  "Password must be at least 8 characters long"
                ),
              }),
            ]),
          })
        );
      });
    });

    it("Handles unexpected errors during login with a 500 status.", async () => {
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

  describe(`GET ${apiProtected}`, () => {
    let validToken: string;
    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
    });

    describe("Success Cases", () => {
      it("Grants access to a protected route with a valid JWT.", async () => {
        const response: Response = await request(app)
          .get(apiProtected)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("This is the auth protected route");
      });
    });

    describe("Fail Cases", () => {
      it("Denies access to a protected route when no token is provided.", async () => {
        const response: Response = await request(app).get(apiProtected);

        expect(response.status).toBe(403); // Forbidden
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("Denies access to a protected route when the token is invalid.", async () => {
        const response: Response = await request(app)
          .get(apiProtected)
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401); // Unauthorized
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Denies access to a protected route when the token is expired.", async () => {
        const response: Response = await request(app)
          .get(apiProtected)
          .set("Authorization", `Bearer ${expiredToken}`);

        expect(response.status).toBe(401); // Unauthorized
        expect(response.body.message).toBe("Invalid or expired token");
      });
    });
  });

  describe(`POST ${apiChangePassword}`, () => {
    let validToken: string;

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
    });

    describe("Success Cases", () => {
      it("Changes the password successfully for an authenticated user.", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validChangePasswordData);

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
    });

    describe("Fail Cases", () => {
      it("Rejects password change when the current password is incorrect.", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${validToken}`)
          .send(wrongOldChangePasswordData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Current password is incorrect");
      });

      it("Rejects password change for an unauthenticated user.", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .send(validChangePasswordData);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("Rejects password change when the token is invalid.", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${invalidToken}`)
          .send(validChangePasswordData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Rejects password change when the user is not found.", async () => {
        await User.deleteMany({}); // Simulate no users in the database

        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validChangePasswordData);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });
    });

    it("Handles unexpected errors during password change with a 500 status.", async () => {
      jest
        .spyOn(User.prototype, "save")
        .mockRejectedValueOnce(new Error("Unexpected error"));

      const response: Response = await request(app)
        .post(apiChangePassword)
        .set("Authorization", `Bearer ${validToken}`)
        .send(validChangePasswordData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
    });
  });

  describe(`GET ${apiAuthHello}`, () => {
    it("Confirms that the public auth route is accessible.", async () => {
      const response: Response = await request(app).get(apiAuthHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public auth route");
    });
  });

  // TODO: Actual Implementation
  describe("GET /api/auth/refresh", () => {
    it("Refreshes a user token successfully.", async () => {
      const response: Response = await request(app).get("/api/auth/refresh");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Token refreshed",
          data: { token: "new-mock-jwt-token" },
        })
      );
    });
  });

  // TODO: Actual Implementation
  describe(`POST ${apiLogout}`, () => {
    it("Logs out a user successfully.", async () => {
      const response: Response = await request(app)
        .post("/api/auth/logout")
        .send({ token: expect.any(String) });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });
  });
});
