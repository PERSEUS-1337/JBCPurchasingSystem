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
import {
  validSuperAdminUser,
  validUser,
  validUserNoPwd,
} from "../setup/mockUsers";
import {
  apiUserHello,
  apiViewUser as apiGetUser,
  apiViewUserByID as apiGetUserByID,
  apiEditUser,
} from "../setup/refRoutes";
import {
  connectDB,
  deleteAllUsers,
  disconnectDB,
  preSaveUserAndGenJWT,
  preSaveUsersAndGenTokens,
} from "../setup/globalSetupHelper";
import { invalidToken, validEditUserData } from "../setup/mockData";
import {
  userProfileAdminViewSchema,
  userProfileViewSchema,
} from "../../src/validators";

describe("User Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiGetUser}`, () => {
    let validToken: string;

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
    });

    describe("Success Cases", () => {
      it("Returns the logged-in user's profile view validated by schema.", async () => {
        const response = await request(app)
          .get(apiGetUser)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);

        // Validate the response against the schema
        const validation = userProfileViewSchema.safeParse(response.body.data);
        // if (!validation.success) {
        //   console.error("Validation errors:", validation.error.issues);
        // }
        expect(validation.success).toBe(true);
      });
    });

    describe("Fail Cases", () => {
      it("Returns 401 for an invalid token.", async () => {
        const response = await request(app)
          .get("/api/user/me")
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Returns 403 if no token is provided.", async () => {
        const response = await request(app).get("/api/user/me");

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("Returns 404 if the user is not found.", async () => {
        await deleteAllUsers();
        const response = await request(app)
          .get("/api/user/me")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });
    });

    it("Returns 500 for an unexpected server error.", async () => {
      jest
        .spyOn(User, "findOne")
        .mockRejectedValueOnce(new Error("Unexpected server error"));

      const response = await request(app)
        .get(apiGetUser)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe(`GET ${apiGetUserByID(":userID")}`, () => {
    let superAdminUserID: string;
    let validUserID: string;
    let validToken: string;
    let superAdminToken: string;
    beforeEach(async () => {
      superAdminUserID = validSuperAdminUser.userID;
      validUserID = validUser.userID;

      // Destructure the tokens into existing variables
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
    });

    describe("Success Cases", () => {
      it("Returns the admin view of a user details for a super admin.", async () => {
        const response = await request(app)
          .get(`/api/user/${validUserID}`)
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(200);

        // Validate the response against the schema
        const validation = userProfileAdminViewSchema.safeParse(
          response.body.data
        );
        expect(validation.success).toBe(true);
      });
    });

    describe("Fail Cases", () => {
      it("Returns 401 for an invalid token.", async () => {
        const response = await request(app)
          .get(`/api/user/${validUserNoPwd.userID}`)
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Returns 403 if a regular user tries to access a super admin's profile.", async () => {
        const response = await request(app)
          .get(`/api/user/${superAdminUserID}`)
          .set("Authorization", `Bearer ${validToken}`); // Regular user token

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Access denied. Super Administrators only."
        );
      });

      it("Returns 403 if no token is provided.", async () => {
        const response = await request(app).get(
          `/api/user/${validUserNoPwd.userID}`
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("Returns 404 if the userID does not exist.", async () => {
        const response = await request(app)
          .get(`/api/user/${"nonExistentUser"}`)
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
      });
    });
  });

  describe(`PUT ${apiEditUser}`, () => {
    let validToken: string;
    let superAdminToken: string;
    let validUserID: string;
    let superAdminUserID: string;

    beforeEach(async () => {
      // Pre-save users and generate tokens
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
      validUserID = validUser.userID;
      superAdminUserID = validSuperAdminUser.userID;
    });

    describe("Success Cases", () => {
      it("Updates the user's details and returns the updated user profile.", async () => {
        const response = await request(app)
          .put(apiEditUser)
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send(validEditUserData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User details updated successfully");
        console.log(response.body.data)
        // Validate the updated user data
        expect(response.body.data.fullname).toBe(validEditUserData.fullname);
        expect(response.body.data.position).toBe(validEditUserData.position);
        expect(response.body.data.department).toBe(validEditUserData.department);
      });
    });

    describe("Fail Cases", () => {
      it("Returns 401 for an invalid token.", async () => {
        const response = await request(app)
          .put(`/api/user/${validUserID}`)
          .set("Authorization", `Bearer ${invalidToken}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid or expired token");
      });

      it("Returns 403 if no token is provided.", async () => {
        const response = await request(app)
          .put(`/api/user/${validUserID}`)
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied, no token provided");
      });

      it("Returns 403 if a regular user tries to update another user's profile.", async () => {
        const response = await request(app)
          .put(`/api/user/${superAdminUserID}`)
          .set("Authorization", `Bearer ${validToken}`) // Regular user token
          .send({ fullname: "Updated Fullname" });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Access denied. You can only update your own profile."
        );
      });

      it("Returns 404 if the userID does not exist.", async () => {
        const response = await request(app)
          .put(`/api/user/nonExistentUser`)
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
          .put(`/api/user/${validUserID}`)
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0].message).toContain(
          "Fullname is required"
        );
      });

      it("Returns 500 for an unexpected server error.", async () => {
        jest
          .spyOn(User, "findOneAndUpdate")
          .mockRejectedValueOnce(new Error("Unexpected server error"));

        const response = await request(app)
          .put(`/api/user/${validUserID}`)
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send({ fullname: "Updated Fullname" });

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
