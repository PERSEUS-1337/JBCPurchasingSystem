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
import {
  apiSupplierAll,
  apiSupplierHello,
  apiSupplierID,
  apiSupplierMain,
  apiSupplierSearch,
  apiUserHello,
  apiUserID,
} from "../setup/refRoutes";
import {
  connectDB,
  disconnectDB,
  dropDB,
  preSaveMultipleSuppliers,
  preSaveSupplier,
  preSaveUsersAndGenTokens,
} from "../setup/globalSetupHelper";
import { invalidToken, validEditUserData } from "../setup/mockData";
import { userAdminViewSchema, userViewSchema } from "../../src/validators";
import {
  createNewSupplierValidData,
  invalidSupplierEmail,
  invalidSuppliesSupplier,
  missingFieldsSupplier,
  validSupplier,
  validSuppliersList,
} from "../setup/mockSuppliers";
import Supplier from "../../src/models/supplierModel";
import mongoose from "mongoose";
import { fromZodError } from "zod-validation-error";

describe("Supplier Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiSupplierID(":supplierID")}`, () => {
    let validUserID: string;
    let superAdminUserID: string;
    let validToken: string;
    let superAdminToken: string;

    beforeEach(async () => {
      superAdminUserID = validSuperAdminUser.userID;
      validUserID = validUser.userID;
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
      await preSaveSupplier();
    });

    describe("Success Cases: GET suppliers by ID", () => {
      it("Returns the specified supplier when accessed with a valid token", async () => {
        const response = await request(app)
          .get(apiSupplierID(validSupplier.supplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supplier details retrieved successfully"
        );
        expect(response.body.data.supplierID).toBe(validSupplier.supplierID);
      });
    });

    describe("Failure Cases: GET suppliers by ID", () => {
      it("Returns 404 when supplier does not exist", async () => {
        const response = await request(app)
          .get(apiSupplierID("nonexistentID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supplier not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(
          apiSupplierID(validSupplier.supplierID)
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      // it("Returns 403 when a user with insufficient privileges tries to access", async () => {
      //   // Assume a different role is tested here
      //   const response = await request(app)
      //     .get(apiSupplierID(validSupplier.supplierID))
      //     .set("Authorization", `Bearer ${invalidToken}`);

      //   expect(response.status).toBe(403);
      //   expect(response.body.message).toBe("Forbidden");
      // });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "findOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiSupplierID(validSupplier.supplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplierAll}`, () => {
    let validUserID: string;
    let superAdminUserID: string;
    let validToken: string;
    let superAdminToken: string;

    beforeEach(async () => {
      superAdminUserID = validSuperAdminUser.userID;
      validUserID = validUser.userID;
      ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
    });

    describe("Success Cases: GET all suppliers", () => {
      it("Returns all suppliers when accessed with a valid token", async () => {
        await preSaveSupplier(); // Save a test supplier

        const response = await request(app)
          .get(apiSupplierAll)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Suppliers retrieved successfully");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe("Failure Cases: GET all suppliers", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiSupplierAll);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 and an empty array when no suppliers exist", async () => {
        const response = await request(app)
          .get(apiSupplierAll)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No suppliers found");
        expect(response.body.data).toEqual([]);
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "find")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiSupplierAll)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplierSearch}`, () => {
    let validUserID: string;
    let validToken: string;

    beforeEach(async () => {
      validUserID = "validUser123"; // Use a mock or retrieved valid user ID
      ({ validToken } = await preSaveUsersAndGenTokens());
      await preSaveMultipleSuppliers(); // Save test suppliers in DB
    });

    describe("Success Cases: Search Suppliers", () => {
      it("Returns matching suppliers when searched with a valid query", async () => {
        const response = await request(app)
          .get(`${apiSupplierSearch}?query=ABC`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Search results retrieved");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].name).toContain("ABC");
      });

      it("Returns multiple results when searching for a common term", async () => {
        const response = await request(app)
          .get(`${apiSupplierSearch}?query=Construction`)
          .set("Authorization", `Bearer ${validToken}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(1);
      });
    });

    describe("Failure Cases: Search Suppliers", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(
          `${apiSupplierSearch}?query=ABC`
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when no query parameter is provided", async () => {
        const response = await request(app)
          .get(apiSupplierSearch)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Search query is required");
      });

      it("Returns 404 if no suppliers match the query", async () => {
        const response = await request(app)
          .get(`${apiSupplierSearch}?query=NonExistentSupplier`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No suppliers matched your search");
        expect(response.body.data).toEqual([]);
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "find")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(`${apiSupplierSearch}?query=ABC`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`POST ${apiSupplierMain}`, () => {
    let validToken: string;

    beforeEach(async () => {
      ({ validToken } = await preSaveUsersAndGenTokens());
    });

    describe("Success Cases: Create Supplier", () => {
      it("Creates a new supplier when provided with valid data", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(createNewSupplierValidData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Supplier created successfully");
        expect(response.body.data.supplierID).toBe(
          createNewSupplierValidData.supplierID
        );
      });
    });

    describe("Failure Cases: Create Supplier", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .send(createNewSupplierValidData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when required fields are missing", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(missingFieldsSupplier);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
      });

      it("Returns 400 when supplierID already exists", async () => {
        await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(createNewSupplierValidData); // First supplier creation

        const duplicateResponse = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(createNewSupplierValidData); // Attempt duplicate creation

        expect(duplicateResponse.status).toBe(400);
        expect(duplicateResponse.body.message).toContain(
          "Supplier ID already exists"
        );
      });

      it("Returns 400 when email format is invalid", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierEmail);

        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Invalid email format"
        );
      });

      it("Returns 400 when contact number format is invalid", async () => {
        const invalidContactSupplier = {
          ...createNewSupplierValidData,
          contactNumbers: ["12345"], // Too short to be valid
        };

        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidContactSupplier);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Contact number can only contain numbers and an optional '+' at the start"
        );
      });

      it("Returns 400 when supplies contains invalid ObjectId", async () => {
        // const invalidSuppliesSupplier = {
        //   ...createNewSupplierValidData,
        //   supplies: ["invalid-object-id"],
        // };

        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSuppliesSupplier);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Input not instance of ObjectId"
        );
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier.prototype, "save")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(createNewSupplierValidData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  //   describe(`GET ${apiUserID(":userID")}`, () => {
  //     let validUserID: string;
  //     let superAdminUserID: string;
  //     let validToken: string;
  //     let superAdminToken: string;

  //     beforeEach(async () => {
  //       superAdminUserID = validSuperAdminUser.userID;
  //       validUserID = validUser.userID;
  //       ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
  //     });

  //     describe("Success Cases", () => {
  //       it("Returns the user's own profile when accessed with a valid token.", async () => {
  //         const response = await request(app)
  //           .get(apiUserID("me"))
  //           .set("Authorization", `Bearer ${validToken}`);

  //         expect(response.status).toBe(200);
  //         const validation = userViewSchema.safeParse(response.body.data);
  //         expect(validation.success).toBe(true);
  //       });

  //       it("Allows a super admin to access another user's details.", async () => {
  //         const response = await request(app)
  //           .get(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${superAdminToken}`);

  //         expect(response.status).toBe(200);
  //         const validation = userAdminViewSchema.safeParse(response.body.data);
  //         expect(validation.success).toBe(true);
  //       });
  //     });

  //     describe("Fail Cases", () => {
  //       it("Returns 401 for an invalid token.", async () => {
  //         const response = await request(app)
  //           .get(apiUserID("me"))
  //           .set("Authorization", `Bearer ${invalidToken}`);

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Invalid or expired token");
  //       });

  //       it("Returns 403 if a regular user tries to access another user's profile.", async () => {
  //         const response = await request(app)
  //           .get(apiUserID(superAdminUserID))
  //           .set("Authorization", `Bearer ${validToken}`);

  //         expect(response.status).toBe(403);
  //         expect(response.body.message).toBe(
  //           "Access denied. Insufficient permissions."
  //         );
  //       });

  //       it("Returns 401 if no token is provided.", async () => {
  //         const response = await request(app).get(apiUserID(superAdminUserID));

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Access denied: No token provided");
  //       });

  //       it("Returns 404 if the userID does not exist.", async () => {
  //         const response = await request(app)
  //           .get(apiUserID("nonExistentUser"))
  //           .set("Authorization", `Bearer ${superAdminToken}`);

  //         expect(response.status).toBe(404);
  //         expect(response.body.message).toBe("User not found");
  //       });

  //       it("Returns 500 for an unexpected server error.", async () => {
  //         jest
  //           .spyOn(User, "findOne")
  //           .mockRejectedValueOnce(new Error("Unexpected server error"));

  //         const response = await request(app)
  //           .get(apiUserID("me"))
  //           .set("Authorization", `Bearer ${validToken}`);

  //         expect(response.status).toBe(500);
  //         expect(response.body.message).toBe("Internal server error");
  //       });
  //     });
  //   });

  //   describe(`PUT ${apiUserID(":userID")}`, () => {
  //     let validToken: string;
  //     let superAdminToken: string;
  //     let validUserID: string;
  //     let superAdminUserID: string;

  //     beforeEach(async () => {
  //       ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
  //       validUserID = validUser.userID;
  //       superAdminUserID = validSuperAdminUser.userID;
  //     });

  //     describe("Success Cases", () => {
  //       it("Allows a super admin to update another user's details.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${superAdminToken}`)
  //           .send(validEditUserData);

  //         expect(response.status).toBe(200);
  //         expect(response.body.message).toBe("User details updated successfully");
  //         expect(response.body.data.fullname).toBe(validEditUserData.fullname);
  //         expect(response.body.data.position).toBe(validEditUserData.position);
  //         expect(response.body.data.department).toBe(
  //           validEditUserData.department
  //         );
  //       });
  //     });

  //     describe("Fail Cases", () => {
  //       it("Returns 401 for an invalid token.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${invalidToken}`)
  //           .send(validEditUserData);

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Invalid or expired token");
  //       });

  //       it("Returns 1 if no token is provided.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID(validUserID))
  //           .send(validEditUserData);

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Access denied: No token provided");
  //       });

  //       it("Returns 403 if a regular user tries to update their own profile.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID(validUserID)) // Regular user cannot edit their own profile
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send({ fullname: "Updated Fullname" });

  //         expect(response.status).toBe(403);
  //         expect(response.body.message).toBe(
  //           "Access denied. Insufficient permissions."
  //         );
  //       });

  //       it("Returns 403 if a regular user tries to update another user's profile.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID(superAdminUserID)) // Regular user cannot edit another user's profile
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send({ fullname: "Updated Fullname" });

  //         expect(response.status).toBe(403);
  //         expect(response.body.message).toBe(
  //           "Access denied. Insufficient permissions."
  //         );
  //       });

  //       it("Returns 404 if the userID does not exist.", async () => {
  //         const response = await request(app)
  //           .put(apiUserID("nonExistentUser"))
  //           .set("Authorization", `Bearer ${superAdminToken}`)
  //           .send({ fullname: "Updated Fullname" });

  //         expect(response.status).toBe(404);
  //         expect(response.body.message).toBe("User not found");
  //       });

  //       it("Returns 400 for invalid input data.", async () => {
  //         const invalidData = {
  //           fullname: "", // Invalid: Empty fullname
  //           position: "Updated Position",
  //           department: "Updated Department",
  //         };

  //         const response = await request(app)
  //           .put(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${superAdminToken}`)
  //           .send(invalidData);

  //         expect(response.status).toBe(400);
  //         expect(response.body.message).toBe("Validation failed");
  //         expect(response.body.errors).toBeInstanceOf(Array);
  //         expect(response.body.errors[0].message).toContain(
  //           "Fullname cannot be empty"
  //         );
  //       });

  //       it("Returns 500 for an unexpected server error.", async () => {
  //         jest
  //           .spyOn(User, "findOneAndUpdate")
  //           .mockRejectedValueOnce(new Error("Unexpected server error"));

  //         const response = await request(app)
  //           .put(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${superAdminToken}`)
  //           .send({ fullname: "Updated Fullname" });

  //         expect(response.status).toBe(500);
  //         expect(response.body.message).toBe("Internal server error");
  //       });
  //     });
  //   });

  //   describe(`DELETE /api/user/:userID`, () => {
  //     let validUserID: string;
  //     let superAdminUserID: string;
  //     let validToken: string;
  //     let superAdminToken: string;

  //     beforeEach(async () => {
  //       ({ validToken, superAdminToken } = await preSaveUsersAndGenTokens());
  //       validUserID = validUser.userID;
  //       superAdminUserID = validSuperAdminUser.userID;
  //     });

  //     describe("Success Cases", () => {
  //       it("Allows the Super Admin to delete a user", async () => {
  //         const response = await request(app)
  //           .delete(apiUserID(validUserID))
  //           .set("Authorization", `Bearer ${superAdminToken}`);

  //         expect(response.status).toBe(200);
  //         expect(response.body.message).toBe("User deleted successfully");
  //         expect(response.body.data.userID).toBe(validUserID);
  //       });
  //     });

  //     describe("Fail Cases", () => {
  //       it("Returns 403 if a regular user tries to delete another user's profile", async () => {
  //         const response = await request(app)
  //           .delete(apiUserID(superAdminUserID))
  //           .set("Authorization", `Bearer ${validToken}`); // Regular user token

  //         expect(response.status).toBe(403);
  //         expect(response.body.message).toBe(
  //           "Access denied. Insufficient permissions."
  //         );
  //       });

  //       it("Returns 404 if the userID does not exist", async () => {
  //         const response = await request(app)
  //           .delete(apiUserID("nonExistentUser"))
  //           .set("Authorization", `Bearer ${superAdminToken}`);

  //         expect(response.status).toBe(404);
  //         expect(response.body.message).toBe("User not found");
  //       });

  //       it("Returns 401 if no token is provided", async () => {
  //         const response = await request(app).delete(apiUserID(validUserID));

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Access denied: No token provided");
  //       });

  //       it("Returns 500 for an unexpected server error", async () => {
  //         jest
  //           .spyOn(User, "findOneAndDelete")
  //           .mockRejectedValueOnce(new Error("Unexpected server error"));

  //         const response = await request(app)
  //           .delete(`/api/user/${validUserID}`)
  //           .set("Authorization", `Bearer ${superAdminToken}`);

  //         expect(response.status).toBe(500);
  //         expect(response.body.message).toBe("Internal server error");
  //       });
  //     });
  //   });

  describe(`GET ${apiSupplierHello}`, () => {
    it("Confirms that the public supplier route is accessible.", async () => {
      const response: Response = await request(app).get(apiSupplierHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public supplier route");
    });
  });
});
