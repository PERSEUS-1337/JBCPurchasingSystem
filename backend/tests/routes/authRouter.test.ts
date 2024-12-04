import request, { Response } from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../src/models/userModel";
import {
  validUser,
  noUsernameUser,
  noPasswordUser,
  weakPasswordUser,
  shortUsernameUser,
  unexpectedUser,
} from "./mockUsers";
import app from "../../src/app";

describe("Authentication Routes", () => {
  const apiRegister = "/api/auth/register";
  const apiLogin = "/api/auth/login";
  const apiLogout = "/api/auth/logout";
  const apiRefresh = "/api/auth/refresh";

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

  beforeEach(async () => {
    // Reset db before each test
    await User.deleteMany({});
  });

  describe(`POST ${apiRegister}`, () => {
    const regSuccessMsg = "User registered successfully";
    const userExistsMsg = "Username already exists";
    const usernameRequiredMsg =
      "User validation failed: username: Path `username` is required.";
    const passwordRequiredMsg =
      "User validation failed: password: Path `password` is required.";
    const passwordShortMsg = "Password must be at least 8 characters long.";
    const invalidRequestMsg = "Invalid request payload";

    it("should register a user successfully", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: regSuccessMsg,
          token: mockToken,
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

      expect(response.status).toBe(400); // Bad Request.
      expect(response.body.message).toBe(usernameRequiredMsg);
    });

    it("should return an error if the password is missing", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(noPasswordUser);

      expect(response.status).toBe(400); // Bad Request.
      expect(response.body.message).toBe(passwordRequiredMsg);
    });

    it("should return an error if the password is too weak", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(weakPasswordUser);

      expect(response.status).toBe(400); // Bad Request.
      expect(response.body.message).toBe(passwordShortMsg);
    });

    it("should not allow unexpected fields in the request", async () => {
      const response: Response = await request(app)
        .post(apiRegister)
        .send(unexpectedUser);

      expect(response.status).toBe(400); // Bad Request.
      expect(response.body.message).toBe(invalidRequestMsg);
    });
  });

  // Existing tests for other routes remain unchanged.
  describe(`POST {apiLogin}`, () => {
    const loginSuccessMsg = "Login successful";

    beforeAll(async () => {
      await User.deleteMany({});
      await new User(validUser).save(); // Pre-save user without actually going through the route.
    });

    it("should login a user successfully", async () => {
      const response: Response = await request(app)
        .post(apiLogin)
        .send(validUser);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(loginSuccessMsg);
      expect(response.body.token).toBe(mockToken);
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
