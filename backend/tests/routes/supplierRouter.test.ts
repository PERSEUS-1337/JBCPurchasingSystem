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
  deleteMultipleSuppliers,
  disconnectDB,
  dropDB,
  preSaveMultipleSuppliers,
  preSaveSupplier,
  preSaveUserAndGenJWT,
  preSaveUsersAndGenTokens,
} from "../setup/globalSetupHelper";
import { invalidToken, validEditUserData } from "../setup/mockData";
import { userAdminViewSchema, userViewSchema } from "../../src/validators";
import {
  invalidSupplierEmails,
  invalidSupplierSupplies,
  invalidUpdateSupplierEmail,
  missingRequiredFieldsSupplier,
  updateSupplierData,
  validSupplierComplete,
  validSupplierMinimum,
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
    let validToken: string;
    let validSupplierID: string;

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      validSupplierID = validSupplierMinimum.supplierID;
      await preSaveSupplier();
    });

    describe("Success Cases: GET suppliers by ID", () => {
      it("Returns the specified supplier when accessed with a valid token", async () => {
        const response = await request(app)
          .get(apiSupplierID(validSupplierMinimum.supplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supplier details retrieved successfully"
        );
        expect(response.body.data.supplierID).toBe(validSupplierMinimum.supplierID);
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
        const response = await request(app).get(apiSupplierID(validSupplierID));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      // it("Returns 403 when a user with insufficient privileges tries to access", async () => {
      //   // Assume a different role is tested here
      //   const response = await request(app)
      //     .get(apiSupplierID(validSupplierMinimum.supplierID))
      //     .set("Authorization", `Bearer ${invalidToken}`);

      //   expect(response.status).toBe(403);
      //   expect(response.body.message).toBe("Forbidden");
      // });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "findOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiSupplierID(validSupplierMinimum.supplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplierAll}`, () => {
    let validToken: string;
    let validSupplierID: string;

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      validSupplierID = validSupplierMinimum.supplierID;
      await preSaveSupplier();
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
        await deleteMultipleSuppliers();
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
    let validToken: string;

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      await preSaveMultipleSuppliers();
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
          .send(validSupplierComplete);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Supplier created successfully");
        expect(response.body.data._id).toBeDefined();
        expect(response.body.data.supplierID).toBe(
          validSupplierComplete.supplierID
        );
      });
    });

    describe("Failure Cases: Create Supplier", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .send(validSupplierComplete);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when required fields are missing", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(missingRequiredFieldsSupplier);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
      });

      it("Returns 400 when supplierID already exists", async () => {
        await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierComplete); // First supplier creation

        const duplicateResponse = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierComplete); // Attempt duplicate creation

        expect(duplicateResponse.status).toBe(400);
        expect(duplicateResponse.body.message).toContain(
          "Supplier ID already exists"
        );
      });

      it("Returns 400 when email format is invalid", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierEmails);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Invalid email format"
        );
      });

      it("Returns 400 when contact number format is invalid", async () => {
        const invalidContactSupplier = {
          ...validSupplierComplete,
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
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierSupplies);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Invalid ObjectId format"
        );
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier.prototype, "save")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierComplete);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  //   describe(`PUT ${apiSupplierID(":supplierID")}`, () => {
  //     let validToken: string;
  //     let validSupplierID: string;
  //     let invalidSupplierID = "SUP-999";

  //     beforeEach(async () => {
  //       validToken = await preSaveUserAndGenJWT();
  //       validSupplierID = validSupplierMinimum.supplierID;
  //       await preSaveSupplier();
  //     });

  //     describe("Success Cases: Update Supplier", () => {
  //       it("Updates a supplier when provided with valid supplierID and update data", async () => {
  //         // const updatedData = { name: "Updated Supplier Name" };

  //         const response = await request(app)
  //           .put(apiSupplierID(validSupplierID))
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send(updateSupplierData);
  //         // console.log(response);

  //         expect(response.status).toBe(200);
  //         expect(response.body.message).toBe("Supplier updated successfully");
  //         expect(response.body.data.name).toBe(updateSupplierData.name);
  //       });
  //     });

  //     describe("Failure Cases: Update Supplier", () => {
  //       it("Returns 401 when no token is provided", async () => {
  //         // const updatedData = { name: "Unauthorized Update" };

  //         const response = await request(app)
  //           .put(apiSupplierID(validSupplierID))
  //           .send(updateSupplierData);

  //         expect(response.status).toBe(401);
  //         expect(response.body.message).toBe("Access denied: No token provided");
  //       });

  //       it("Returns 404 when supplierID does not exist", async () => {
  //         // const updatedData = { name: "Non-Existent Supplier" };

  //         const response = await request(app)
  //           .put(apiSupplierID(invalidSupplierID))
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send(updateSupplierData);

  //         expect(response.status).toBe(404);
  //         expect(response.body.message).toBe("Supplier not found");
  //       });

  //       it("Returns 400 when no update data is provided", async () => {
  //         const response = await request(app)
  //           .put(apiSupplierID(validSupplierID))
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send({}); // Sending an empty update object

  //         expect(response.status).toBe(400);
  //         expect(response.body.message).toContain("No update data provided");
  //       });

  //       it("Returns 400 when trying to update with an invalid email format", async () => {
  //         // const invalidUpdate = { email: "invalid-email" };

  //         const response = await request(app)
  //           .put(apiSupplierID(validSupplierID))
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send(invalidUpdateSupplierEmail);

  //         console.log(response.body);
  //         expect(response.status).toBe(400);
  //         expect(response.body.message).toContain("Validation failed");
  //         expect(response.body.errors[0].message).toContain(
  //           "Invalid email format"
  //         );
  //       });

  //       it("Returns 500 when there is a server error", async () => {
  //         jest
  //           .spyOn(Supplier, "findOneAndUpdate")
  //           .mockRejectedValueOnce(new Error("Database error"));

  //         const response = await request(app)
  //           .put(apiSupplierID(validSupplierID))
  //           .set("Authorization", `Bearer ${validToken}`)
  //           .send({ name: "Should not update" });

  //         expect(response.status).toBe(500);
  //         expect(response.body.message).toBe("Internal server error");
  //       });
  //     });
  //   });

  describe(`DELETE ${apiSupplierID(":supplierID")}`, () => {
    let validToken: string;
    let validSupplierID: string;
    let invalidSupplierID = "SUP-999";

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      validSupplierID = validSupplierMinimum.supplierID;
      await preSaveSupplier();
    });

    describe("Success Cases: Delete Supplier", () => {
      it("Deletes a supplier when provided with a valid supplierID", async () => {
        const response = await request(app)
          .delete(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplier deleted successfully");
      });
    });

    describe("Failure Cases: Delete Supplier", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).delete(
          apiSupplierID(validSupplierID)
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when supplierID does not exist", async () => {
        const response = await request(app)
          .delete(apiSupplierID(invalidSupplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supplier not found");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "findOneAndDelete")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .delete(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplierHello}`, () => {
    it("Confirms that the public supplier route is accessible.", async () => {
      const response: Response = await request(app).get(apiSupplierHello);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This is the public supplier route");
    });
  });
});
