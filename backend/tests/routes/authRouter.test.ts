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
      it("register user successfully", async () => {
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
    });

    describe("Fail Cases", () => {
      it("reject duplicate usernames", async () => {
        await preSaveValidUser();

        const response: Response = await request(app)
          .post(apiRegister)
          .send(validUser); // Try registering the same user.

        expect(response.status).toBe(409); // Conflict status code.
        expect(response.body.message).toBe("Username or email already exists");
      });

      it("reject missing username", async () => {
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

      it("reject short username", async () => {
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

      it("reject missing password", async () => {
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

      it("reject weak password", async () => {
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

      it("reject unexpected fields", async () => {
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

    it("500 error for unexpected error in registraiton", async () => {
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
      it("login user successfully", async () => {
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
    });

    describe("Fail Cases", () => {
      it("reject NON-EXISTENT user", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(nonExistentUserLoginData);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exist.");
      });

      it("reject INCORRECT password", async () => {
        const response: Response = await request(app)
          .post(apiLogin)
          .send(invalidPasswordLoginData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials.");
      });

      it("reject INVALID email format", async () => {
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

      it("reject SHORT password", async () => {
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

    it("500 error for unexpected error in login", async () => {
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
      it("access PROTECTED ROUTE with JWT successfully", async () => {
        const response: Response = await request(app)
          .get(apiProtected)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("This is the auth protected route");
      });
    });

    describe("Fail Cases", () => {
      it("reject MISSING TOKEN provided", async () => {
        const response: Response = await request(app).get(apiProtected);

        expect(response.status).toBe(403); // Forbidden
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("reject INVALID token", async () => {
        const response: Response = await request(app)
          .get(apiProtected)
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401); // Unauthorized
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("reject EXPIRED token", async () => {
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
      it("change PASSWORD for AUTH'ed users successfully", async () => {
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
      it("reject WRONG OLD password", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${validToken}`)
          .send(wrongOldChangePasswordData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Current password is incorrect");
      });

      it("reject UNAUTHENTICATED user", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .send(validChangePasswordData);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("reject INVALID token", async () => {
        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${invalidToken}`)
          .send(validChangePasswordData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("reject NOT FOUND user", async () => {
        await User.deleteMany({}); // Simulate no users in the database

        const response: Response = await request(app)
          .post(apiChangePassword)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validChangePasswordData);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });
    });

    it("should return a 500 error for unexpected server issues", async () => {
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
    it("should access the public auth route to confirm that it exists", async () => {
      const response: Response = await request(app).get(apiAuthHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public auth route");
    });
  });

  // TODO: Actual Implementation
  describe("GET /api/auth/refresh", () => {
    it("should refresh a user token", async () => {
      const response: Response = await request(app).get("/api/auth/refresh");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Token refreshed");
      expect(response.body.token).toBe("new-mock-jwt-token");
    });
  });

  // TODO: Actual Implementation
  describe(`POST ${apiLogout}`, () => {
    it("should logout a user successfully", async () => {
      const response: Response = await request(app)
        .post("/api/auth/logout")
        .send({ token: "mock-jwt-token" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });
  });
});
