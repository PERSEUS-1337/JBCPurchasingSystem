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
import { validSuperAdminUser, validUser } from "../setup/mockUsers";
import { apiUserHello, apiUserID } from "../setup/refRoutes";
import {
  connectDB,
  disconnectDB,
  preSaveUsersAndGenTokens,
} from "../setup/globalSetupHelper";
import { invalidToken, validEditUserData } from "../setup/mockData";
import { userAdminViewSchema, userViewSchema } from "../../src/validators";

describe("User Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiUserID(":userID")}`, () => {
    let validUserID: string;
    let superAdminUserID: string;
    let validToken: string;
    let superAdminToken: string;

    beforeEach(async () => {
      superAdminUserID = validSuperAdminUser.userID;
      validUserID = validUser.userID;
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
    });

    describe("Success Cases", () => {
      it("Returns the user's own profile when accessed with a valid token.", async () => {
        const response = await request(app)
          .get(apiUserID("me"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        const validation = userViewSchema.safeParse(response.body.data);
        expect(validation.success).toBe(true);
      });

      it("Allows a super admin to access another user's details.", async () => {
        const response = await request(app)
          .get(apiUserID(validUserID))
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        const validation = userAdminViewSchema.safeParse(response.body.data);
        expect(validation.success).toBe(true);
      });
    });

    describe("Fail Cases", () => {
      it("Returns 401 for an invalid token.", async () => {
        const response = await request(app)
          .get(apiUserID("me"))
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Returns 403 if a regular user tries to access another user's profile.", async () => {
        const response = await request(app)
          .get(apiUserID(superAdminUserID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Forbidden: Insufficient permissions."
        );
      });

      it("Returns 401 if no token is provided.", async () => {
        const response = await request(app).get(apiUserID(superAdminUserID));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 if the userID does not exist.", async () => {
        const response = await request(app)
          .get(apiUserID("nonExistentUser"))
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });

      it("Returns 500 for an unexpected server error.", async () => {
        jest
          .spyOn(User, "findOne")
          .mockRejectedValueOnce(new Error("Unexpected server error"));

        const response = await request(app)
          .get(apiUserID("me"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PUT ${apiUserID(":userID")}`, () => {
    let validToken: string;
    let superAdminToken: string;
    let validUserID: string;
    let superAdminUserID: string;

    beforeEach(async () => {
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
      validUserID = validUser.userID;
      superAdminUserID = validSuperAdminUser.userID;
    });

    describe("Success Cases", () => {
      it("Allows a super admin to update another user's details.", async () => {
        const response = await request(app)
          .put(apiUserID(validUserID))
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send(validEditUserData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User details updated successfully");
        expect(response.body.data.fullname).toBe(validEditUserData.fullname);
        expect(response.body.data.position).toBe(validEditUserData.position);
        expect(response.body.data.department).toBe(
          validEditUserData.department
        );
      });
    });

    describe("Fail Cases", () => {
      it("Returns 401 for an invalid token.", async () => {
        const response = await request(app)
          .put(apiUserID(validUserID))
          .set("Authorization", `Bearer ${invalidToken}`)
          .send(validEditUserData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Returns 1 if no token is provided.", async () => {
        const response = await request(app)
          .put(apiUserID(validUserID))
          .send(validEditUserData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 403 if a regular user tries to update their own profile.", async () => {
        const response = await request(app)
          .put(apiUserID(validUserID)) // Regular user cannot edit their own profile
          .set("Authorization", `Bearer ${validToken}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Forbidden: Insufficient permissions."
        );
      });

      it("Returns 403 if a regular user tries to update another user's profile.", async () => {
        const response = await request(app)
          .put(apiUserID(superAdminUserID)) // Regular user cannot edit another user's profile
          .set("Authorization", `Bearer ${validToken}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Forbidden: Insufficient permissions."
        );
      });

      it("Returns 404 if the userID does not exist.", async () => {
        const response = await request(app)
          .put(apiUserID("nonExistentUser"))
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });

      it("Returns 400 for invalid input data.", async () => {
        const invalidData = {
          fullname: "", // Invalid: Empty fullname
          position: "Updated Position",
          department: "Updated Department",
        };

        const response = await request(app)
          .put(apiUserID(validUserID))
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0].message).toContain(
          "Fullname cannot be empty"
        );
      });

      it("Returns 500 for an unexpected server error.", async () => {
        jest
          .spyOn(User, "findOneAndUpdate")
          .mockRejectedValueOnce(new Error("Unexpected server error"));

        const response = await request(app)
          .put(apiUserID(validUserID))
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`DELETE /api/user/:userID`, () => {
    let validUserID: string;
    let superAdminUserID: string;
    let validToken: string;
    let superAdminToken: string;

    beforeEach(async () => {
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
      validUserID = validUser.userID;
      superAdminUserID = validSuperAdminUser.userID;
    });

    describe("Success Cases", () => {
      it("Allows the Super Admin to delete a user", async () => {
        const response = await request(app)
          .delete(apiUserID(validUserID))
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User deleted successfully");
        expect(response.body.data.userID).toBe(validUserID);
      });
    });

    describe("Fail Cases", () => {
      it("Returns 403 if a regular user tries to delete another user's profile", async () => {
        const response = await request(app)
          .delete(apiUserID(superAdminUserID))
          .set("Authorization", `Bearer ${validToken}`); // Regular user token

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Forbidden: Insufficient permissions."
        );
      });

      it("Returns 404 if the userID does not exist", async () => {
        const response = await request(app)
          .delete(apiUserID("nonExistentUser"))
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });

      it("Returns 401 if no token is provided", async () => {
        const response = await request(app).delete(apiUserID(validUserID));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 for an unexpected server error", async () => {
        jest
          .spyOn(User, "findOneAndDelete")
          .mockRejectedValueOnce(new Error("Unexpected server error"));

        const response = await request(app)
          .delete(`/api/user/${validUserID}`)
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiUserHello}`, () => {
    it("Confirms that the public user route is accessible.", async () => {
      const response: Response = await request(app).get(apiUserHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public user route");
    });
  });
});
