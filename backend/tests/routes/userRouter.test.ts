import request, { Response } from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import app from "../../src/app"; // Import your Express app
import User from "../../src/models/userModel";
import { validUser, validUserNoPwd } from "../mockUsers";
import { apiMe } from "../refRoutes";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { generateJWT } from "../../src/utils/jwtUtils";

describe("User Routes", () => {
  let validToken: string;
  let nonExistentToken: string;
  const invalidToken: string = "invalid-token";

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

  describe(`GET ${apiMe}`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });
    it("should return user details for a valid JWT", async () => {
      const response: Response = await request(app)
        .get(apiMe)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(validUserNoPwd));
    });

    it("should return 403 if no token is provided", async () => {
      const response: Response = await request(app).get(apiMe); // No Authorization header

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied, no token provided");
    });

    it("should return 401 for an invalid token", async () => {
      const response: Response = await request(app)
        .get(apiMe)
        .set("Authorization", `Bearer ${invalidToken}`); // Attach the token to the request

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return 404 if the user is not found", async () => {
      nonExistentToken = await generateJWT("U000");
      const response: Response = await request(app)
        .get(apiMe)
        .set("Authorization", `Bearer ${nonExistentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found.");
    });
  });
});
