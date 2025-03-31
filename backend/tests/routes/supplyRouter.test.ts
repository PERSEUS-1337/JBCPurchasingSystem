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
  connectDB,
  disconnectDB,
  clearCollection,
  preSaveMultipleSupplies,
  preSaveSupply,
  preSaveUserAndGenJWT,
  preSaveMultipleSuppliers,
} from "../setup/globalSetupHelper";
import Supply from "../../src/models/supplyModel";
import Supplier from "../../src/models/supplierModel";
import {
  missingRequiredFieldsSupply,
  validSupplyComplete,
  validSupplyMinimum,
  validUpdateSupply,
} from "../setup/mockSupplies";
import {
  apiSupplyID,
  apiSupplyIDStatus,
  apiSupplyMain,
  apiSupplySearch,
} from "../setup/refRoutes";

describe("Supply Routes", () => {
  let validToken: string;
  let validSupplyID: string;

  beforeAll(async () => {
    await connectDB();
    validToken = await preSaveUserAndGenJWT();
  });

  beforeEach(async () => {
    await clearCollection(Supply);
    await clearCollection(Supplier);
    // Save suppliers first since supplies depend on them
    await preSaveMultipleSuppliers();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiSupplyID(":supplyID")}`, () => {
    describe("Success Cases: GET supplies by ID", () => {
      it("Returns the specified supply when accessed with a valid token", async () => {
        await preSaveSupply();
        validSupplyID = validSupplyComplete.supplyID;
        const response = await request(app)
          .get(apiSupplyID(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supply details retrieved successfully"
        );
        expect(response.body.data.supplyID).toBe(validSupplyID);
      });
    });

    describe("Failure Cases: GET supplies by ID", () => {
      it("Returns 404 when supply does not exist", async () => {
        const response = await request(app)
          .get(apiSupplyID("nonexistentID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supply not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiSupplyID("anyid"));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supply, "findOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiSupplyID("validID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplyMain}`, () => {
    describe("Success Cases: GET all supplies", () => {
      it("Returns all supplies when accessed with a valid token", async () => {
        await preSaveMultipleSupplies();
        const response = await request(app)
          .get(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplies retrieved successfully");
        expect(response.body.data).toHaveLength(3);
      });

      it("Returns empty data with a success code and 'No data yet' message when no supplies exist", async () => {
        const response = await request(app)
          .get(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("No data yet");
        expect(response.body.data).toEqual([]);
      });
    });

    describe("Failure Cases: GET all supplies", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiSupplyMain);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(Supply, "find")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`GET ${apiSupplySearch}`, () => {
    describe("Success Cases: Search Supplies", () => {
      it("Returns matching supplies with valid query", async () => {
        await preSaveMultipleSupplies();
        const response = await request(app)
          .get(`${apiSupplySearch}?query=Bolt`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(
          response.body.data.some((s: any) => s.name.includes("Bolt"))
        ).toBe(true);
      });

      it("Returns empty array and message when no query parameter", async () => {
        const response = await request(app)
          .get(apiSupplySearch)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("No supplies matched your search");
        expect(response.body.data).toEqual([]);
      });

      it("Returns empty array and message when no matches found", async () => {
        const response = await request(app)
          .get(`${apiSupplySearch}?query=NonExistent`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplies retrieved");
        expect(response.body.data).toEqual([]);
      });
    });

    describe("Failure Cases: Search Supplies", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(
          `${apiSupplySearch}?query=Bolt`
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 on server error", async () => {
        jest
          .spyOn(Supply, "find")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(`${apiSupplySearch}?query=Bolt`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`POST ${apiSupplyMain}`, () => {
    describe("Success Cases: Create Supply", () => {
      it("Creates a new supply with valid complete data and token", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyComplete);
        console.log("validSupplyComplete", validSupplyComplete);
        console.log("response.body", response.body);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Supply created successfully");
        expect(response.body.data.supplyID).toBe(validSupplyComplete.supplyID);
        expect(response.body.createdAt).toBeDefined();
      });

      it("Creates a new supply with valid minimum data and token", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyMinimum);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Supply created successfully");
        expect(response.body.data.supplyID).toBe(validSupplyMinimum.supplyID);
        expect(response.body.createdAt).toBeDefined();
      });
    });

    describe("Failure Cases: Create Supply", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .send(validSupplyComplete);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when supplyID is duplicate", async () => {
        await preSaveSupply();
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyComplete);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Supply ID already exists");
      });

      it("Returns 400 when invalid data is sent", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(missingRequiredFieldsSupply);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/validation failed/i);
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(Supply.prototype, "save").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyMinimum);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PATCH ${apiSupplyMain}/:supplyID`, () => {
    describe("Success Cases: Update Supply", () => {
      it("Updates an existing supply with valid update data and token", async () => {
        await preSaveSupply();

        const response = await request(app)
          .patch(apiSupplyID(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validUpdateSupply);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supply updated successfully");
        expect(response.body.data.categories).toEqual(
          validUpdateSupply.categories
        );
      });
    });

    describe("Failure Cases: Update Supply", () => {
      it("Returns 400 when no update data is provided", async () => {
        await preSaveSupply();

        const response = await request(app)
          .patch(apiSupplyID(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("No valid update data provided");
      });

      it("Returns 404 when supply is not found", async () => {
        const response = await request(app)
          .patch(`${apiSupplyMain}/nonExistingSupplyID`)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validUpdateSupply);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supply not found");
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(Supply, "findOneAndUpdate").mockImplementationOnce(() => {
          throw new Error("Database error");
        });
        const response = await request(app)
          .patch(apiSupplyID(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validUpdateSupply);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`DELETE ${apiSupplyID(":supplyID")}`, () => {
    describe("Success Cases: Delete Supply", () => {
      it("Deletes an existing supply with valid token and supplyID", async () => {
        await preSaveSupply();
        validSupplyID = validSupplyComplete.supplyID;
        const response = await request(app)
          .delete(apiSupplyID(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supply deleted successfully");
        expect(response.body.data.supplyID).toBe(validSupplyID);

        const deletedSupply = await Supply.findOne({
          supplyID: validSupplyID,
        });
        expect(deletedSupply).toBeNull();
      });
    });

    describe("Failure Cases: Delete Supply", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).delete(apiSupplyID("anyid"));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when supplyID does not exist", async () => {
        const response = await request(app)
          .delete(apiSupplyID("nonexistent123"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supply not found");
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(Supply, "findOneAndDelete").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        const response = await request(app)
          .delete(apiSupplyID("validID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PATCH ${apiSupplyMain}/:supplyID/status`, () => {
    describe("Success Cases: Update Supply Status", () => {
      it("should update supply status successfully with a valid token", async () => {
        await preSaveSupply();
        const newStatus = "Inactive";

        const response = await request(app)
          .patch(apiSupplyIDStatus(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: newStatus });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Supply status updated successfully"
        );
        expect(response.body.data.status).toBe(newStatus);
      });
    });

    describe("Failure Cases: Update Supply Status", () => {
      it("should return 404 if the supply is not found", async () => {
        const response = await request(app)
          .patch(apiSupplyIDStatus("non-existing-id"))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Inactive" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Supply not found");
      });

      it("should return 401 when no token is provided", async () => {
        await preSaveSupply();
        const response = await request(app)
          .patch(apiSupplyIDStatus(validSupplyID))
          .send({ status: "Inactive" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("should return 500 when there is a server error", async () => {
        jest.spyOn(Supply, "findOneAndUpdate").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        const response = await request(app)
          .patch(apiSupplyIDStatus(validSupplyID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ status: "Inactive" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
        expect(response.body.error).toBe("Database error");
      });
    });
  });
});
