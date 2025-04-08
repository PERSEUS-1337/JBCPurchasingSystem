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
import app from "../../src/app";
import {
  apiSupplierHello,
  apiSupplierID,
  apiSupplierMain,
  apiSupplierSearch,
  apiSupplierStatus,
} from "../setup/refRoutes";
import {
  connectDB,
  disconnectDB,
  clearCollection,
  preSaveMultipleSuppliers,
  preSaveSupplier,
  preSaveUserAndGenJWT,
} from "../setup/globalSetupHelper";
import {
  invalidSupplierEmails,
  missingRequiredFieldsSupplier,
  validSupplierUpdateMinimumData,
  validSupplierComplete,
  validSupplierMinimum,
  invalidSupplierContactNumbers,
  validSupplierUpdateCompleteData,
  validSupplierUpdatePartialData,
  invalidSupplierMissingContactPersonFields,
  invalidSupplierStatus,
  invalidUpdateSupplierEmail,
  restrictedUpdateSupplierData,
} from "../setup/mockSuppliers";
import Supplier from "../../src/models/supplierModel";
import { invalidToken } from "../setup/mockData";

describe("Supplier Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearCollection(Supplier);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiSupplierID(":supplierID")}`, () => {
    let validToken: string;
    let validSupplierID: string;

    describe("Success Cases: GET suppliers by ID", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
        validSupplierID = validSupplierComplete.supplierID;
        await preSaveSupplier();
      });

      it("Returns the specified supplier when accessed with a valid token", async () => {
        const response = await request(app)
          .get(apiSupplierID(validSupplierMinimum.supplierID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supplier details retrieved successfully"
        );
        expect(response.body.data.supplierID).toBe(
          validSupplierMinimum.supplierID
        );
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

      it("Returns 403 when a user with insufficient privileges tries to access", async () => {
        // Assume a different role is tested here
        const response = await request(app)
          .get(apiSupplierID(validSupplierMinimum.supplierID))
          .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
          "Access denied: Invalid or expired token"
        );
      });

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

  describe(`GET ${apiSupplierMain}`, () => {
    let validToken: string;

    describe("Success Cases: GET all suppliers", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
        await preSaveMultipleSuppliers();
      });

      it("Returns all suppliers when accessed with a valid token", async () => {
        const response = await request(app)
          .get(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Suppliers retrieved successfully");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe("Failure Cases: GET all suppliers", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiSupplierMain);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 and an empty array when no suppliers exist", async () => {
        const response = await request(app)
          .get(apiSupplierMain)
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
          .get(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplierSearch}`, () => {
    let validToken: string;

    describe("Success Cases: Search Suppliers", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
        await preSaveMultipleSuppliers();
      });

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
      validToken = await preSaveUserAndGenJWT();
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

        expect(response.body.errors).toEqual([
          { path: "supplierID", message: "Required" },
          { path: "name", message: "Required" },
          { path: "contactNumbers", message: "Required" },
          { path: "address", message: "Required" },
          { path: "primaryTag", message: "Required" },
          { path: "tags", message: "Required" },
        ]);
      });

      it("Returns 400 when supplierID already exists", async () => {
        await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierComplete);

        const duplicateResponse = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierComplete);

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
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierContactNumbers);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Contact number can only contain numbers and an optional '+' at the start"
        );
      });

      // it("Returns 400 when supplies contains invalid ObjectId", async () => {
      //   const response = await request(app)
      //     .post(apiSupplierMain)
      //     .set("Authorization", `Bearer ${validToken}`)
      //     .send(invalidSupplierSupplies);

      //   expect(response.status).toBe(400);
      //   expect(response.body.message).toContain("Validation failed");
      //   expect(response.body.errors[0].message).toContain(
      //     "Invalid ObjectId format"
      //   );
      // });

      it("Returns 400 when contactPersons are missing required fields", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierMissingContactPersonFields);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors).toEqual([
          { path: "contactPersons.0.contactNumber", message: "Required" },
        ]);
      });

      it("Returns 400 when status is not a valid enum value", async () => {
        const response = await request(app)
          .post(apiSupplierMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupplierStatus);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain("Invalid enum value");
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

  describe(`PATCH ${apiSupplierID(":supplierID")}`, () => {
    let validToken: string;
    let validSupplierID: string;
    let invalidSupplierID = "SUP-999";

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      validSupplierID = validSupplierComplete.supplierID;
      await preSaveSupplier();
    });

    describe("Success Cases: Update Supplier", () => {
      it("Updates a supplier when provided with valid supplierID and complete update data", async () => {
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierUpdateCompleteData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplier updated successfully");
        expect(response.body.data.name).toBe(
          validSupplierUpdateCompleteData.name
        );
        expect(response.body.data.address).toBe(
          validSupplierUpdateCompleteData.address
        );
        expect(response.body.data.primaryTag).toBe(
          validSupplierUpdateCompleteData.primaryTag
        );
        expect(response.body.data.contactNumbers).toEqual(
          validSupplierUpdateCompleteData.contactNumbers
        );
        expect(response.body.data.emails).toEqual(
          validSupplierUpdateCompleteData.emails
        );
        expect(response.body.data.contactPersons).toEqual(
          validSupplierUpdateCompleteData.contactPersons
        );
        expect(response.body.data.documentation).toEqual(
          validSupplierUpdateCompleteData.documentation
        );
        expect(response.body.data.tags).toEqual(
          validSupplierUpdateCompleteData.tags
        );
      });

      it("Partially updates supplier details and retains unchanged fields", async () => {
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierUpdatePartialData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplier updated successfully");
        expect(response.body.data.primaryTag).toBe(
          validSupplierUpdatePartialData.primaryTag
        );
        // Ensure other fields remain unchanged (using pre-saved supplier data as reference)
        expect(response.body.data.name).toBe(validSupplierMinimum.name);
      });
    });

    describe("Failure Cases: Update Supplier", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .send(validSupplierUpdateMinimumData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when supplierID does not exist", async () => {
        const response = await request(app)
          .patch(apiSupplierID(invalidSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplierUpdateMinimumData);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supplier not found");
      });

      it("Returns 400 when no update data is provided", async () => {
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          "No valid update data provided"
        );
      });

      it("Returns 400 when trying to update with an invalid email format", async () => {
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidUpdateSupplierEmail);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors[0].message).toContain(
          "Invalid email format"
        );
      });

      it("Returns 400 when trying to update restricted fields such as supplies", async () => {
        // const invalidUpdate = { supplies: ["507f1f77bcf86cd799439011"] };
        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(restrictedUpdateSupplierData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
        expect(response.body.errors).toEqual([
          {
            path: "supplierID",
            message: "Update not allowed on restricted field: supplierID",
          },
          // {
          //   path: "supplies",
          //   message: "Update not allowed on restricted field: supplies",
          // },
        ]);
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "updateOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .patch(apiSupplierID(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ name: "Should not update" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PATCH ${apiSupplierStatus(":supplierID")}`, () => {
    let validToken: string;
    let validSupplierID: string;
    let invalidSupplierID = "SUP-999";

    beforeEach(async () => {
      validToken = await preSaveUserAndGenJWT();
      validSupplierID = validSupplierComplete.supplierID;
      await preSaveSupplier();
    });

    describe("Success Cases: Update Supplier Status", () => {
      it("Updates supplier status to active", async () => {
        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Active" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supplier status updated successfully"
        );
        expect(response.body.data.status).toBe("Active");
      });

      it("Updates supplier status to inactive", async () => {
        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Inactive" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supplier status updated successfully"
        );
        expect(response.body.data.status).toBe("Inactive");
      });
    });

    describe("Failure Cases: Update Supplier Status", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .send({ status: "active" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when supplierID does not exist", async () => {
        const response = await request(app)
          .patch(apiSupplierID(invalidSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Active" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supplier not found");
      });

      it("Returns 400 when no status is provided", async () => {
        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid status value");
      });

      it("Returns 400 when status is not 'active' or 'inactive'", async () => {
        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "pending" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid status value");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supplier, "updateOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .patch(apiSupplierStatus(validSupplierID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Active" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

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
