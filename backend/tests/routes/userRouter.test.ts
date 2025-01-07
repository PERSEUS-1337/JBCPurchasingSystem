import request, { Response } from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import app from "../../src/app"; // Import your Express app
import User from "../../src/models/userModel";
import { validUser, validUserNoPwd } from "../setup/mockUsers";
import {
  apiGetUserById,
  apiMe,
  apiUpdateUser,
  apiUserHello,
} from "../setup/refRoutes";
import { generateJWT } from "../../src/utils/authUtils";
import {
  connectDB,
  disconnectDB,
  preSaveUserAndGenJWT,
} from "../setup/globalSetupHelper";
import { invalidToken } from "../setup/mockData";

describe("User Routes", () => {
  let validToken: string;
  beforeAll(async () => {
    await connectDB();
    validToken = await preSaveUserAndGenJWT();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiMe}`, () => {
    describe("Success Cases", () => {
      it("should return user details for a valid JWT", async () => {
        const response: Response = await request(app)
          .get(apiMe)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining(validUserNoPwd));
      });
    });

    describe("Fail Cases", () => {
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
        const nonExistentToken = await generateJWT("U000");
        const response: Response = await request(app)
          .get(apiMe)
          .set("Authorization", `Bearer ${nonExistentToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found.");
      });
    });

    // TODO: Fix this test case
    // it("500 error for unexpected error in fetching user details", async () => {
    //   jest
    //     .spyOn(User, "findOne")
    //     .mockRejectedValueOnce(new Error("Database error"));

    //   const response: Response = await request(app)
    //     .get(apiMe)
    //     .set("Authorization", `Bearer ${validToken}`); // Ensure validToken is properly set up

    //   expect(response.status).toBe(500); // Internal server error
    //   expect(response.body.message).toBe("Internal server error");
    // });
  });

  describe(`GET ${apiGetUserById(":userID")}`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });

    it("should get a user's details by ID in params", async () => {
      const response: Response = await request(app)
        .get(apiGetUserById(validUserNoPwd.userID))
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(validUserNoPwd));
    });

    it("should return 404 if the user ID does not exist", async () => {
      const response: Response = await request(app)
        .get(apiGetUserById("NonExistentID"))
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found.");
    });

    it("should return 403 if no token is provided", async () => {
      const response: Response = await request(app).get(
        apiGetUserById(validUserNoPwd.userID)
      );

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied, no token provided");
    });

    it("should return 401 for an invalid token", async () => {
      const response: Response = await request(app)
        .get(apiGetUserById(validUserNoPwd.userID))
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired token");
    });
  });

  describe(`POST ${apiUpdateUser}`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });

    it("should update the user details successfully", async () => {
      const updates = {
        fullname: "Updated Name",
        email: "updated@example.com",
      };

      const response: Response = await request(app)
        .post(apiUpdateUser)
        .set("Authorization", `Bearer ${validToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User details updated successfully");
      expect(response.body.user).toEqual(
        expect.objectContaining({ ...validUserNoPwd, ...updates })
      );

      const updatedUser = await User.findOne({
        userID: validUserNoPwd.userID,
      }).lean();
      const { password, __v, ...filteredUser } = updatedUser!;
      expect(filteredUser).toEqual(
        expect.objectContaining({ ...validUserNoPwd, ...updates })
      );
    });

    it("should return 404 if the user is not found", async () => {
      const nonExistentToken = await generateJWT("NonExistentID");
      const updates = { name: "Nonexistent User" };

      const response: Response = await request(app)
        .post(apiUpdateUser)
        .set("Authorization", `Bearer ${nonExistentToken}`)
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found.");
    });

    it("should return 403 if no token is provided", async () => {
      const updates = { name: "Unauthorized User" };

      const response: Response = await request(app)
        .post(apiUpdateUser)
        .send(updates);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied, no token provided");
    });

    it("should return 401 for an invalid token", async () => {
      const updates = { name: "Invalid Token User" };

      const response: Response = await request(app)
        .post(apiUpdateUser)
        .set("Authorization", `Bearer ${invalidToken}`)
        .send(updates);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should handle server errors gracefully", async () => {
      jest.spyOn(User, "findOneAndUpdate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const updates = { name: "Server Error User" };

      const response: Response = await request(app)
        .post(apiUpdateUser)
        .set("Authorization", `Bearer ${validToken}`)
        .send(updates);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("Additional Edge Cases", () => {
    beforeEach(async () => {
      await User.deleteMany({});
      const user = await new User(validUser).save();
      validToken = await generateJWT(user.userID);
    });

    it("should handle server errors gracefully", async () => {
      // Mock User.findOne to throw an error
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response: Response = await request(app)
        .get(apiGetUserById(validUserNoPwd.userID))
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe(`GET ${apiUserHello}`, () => {
    it("should access the public auth route to confirm that it exists", async () => {
      const response: Response = await request(app).get(apiUserHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public user route");
    });
  });
});
