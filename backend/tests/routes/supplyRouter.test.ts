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
  dropDB,
  preSaveMultipleSupplies,
  preSaveSupply,
  preSaveUserAndGenJWT,
} from "../setup/globalSetupHelper";
import Supply from "../../src/models/supplyModel";
import { validSupplyComplete, validSupplyMinimum } from "../setup/mockSupplies";
import {
  apiSupplyID,
  apiSupplyMain,
  apiSupplySearch,
} from "../setup/refRoutes";

describe("Supply Routes", () => {
  let validToken: string;

  beforeAll(async () => {
    await connectDB();
    validToken = await preSaveUserAndGenJWT();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiSupplyID(":supplyID")}`, () => {
    let validSupplyID: string;

    describe("Success Cases: GET supplies by ID", () => {
      beforeEach(async () => {
        await preSaveSupply();
        validSupplyID = validSupplyComplete.supplyID;
      });

      it("Returns the specified supply when accessed with a valid token", async () => {
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
      // beforeEach(async () => {
      //   validToken = await preSaveUserAndGenJWT();
      // });

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
    // let validToken: string;

    describe("Success Cases: GET all supplies", () => {
      beforeEach(async () => {
        // validToken = await preSaveUserAndGenJWT();
        await preSaveMultipleSupplies();
      });

      it("Returns all supplies when accessed with a valid token", async () => {
        const response = await request(app)
          .get(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supplies retrieved successfully");
        expect(response.body.data).toHaveLength(3);
      });
    });

    describe("Failure Cases: GET all supplies", () => {
      // beforeEach(async () => {
      //   validToken = await preSaveUserAndGenJWT();
      // });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiSupplyMain);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when no supplies exist", async () => {
        const response = await request(app)
          .get(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No supplies found");
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
    // let validToken: string;

    describe("Success Cases: Search Supplies", () => {
      beforeEach(async () => {
        // validToken = await preSaveUserAndGenJWT();
        await preSaveMultipleSupplies();
      });

      it("Returns matching supplies with valid query", async () => {
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
        expect(response.body.message).toBe("No supplies matched your search");
        expect(response.body.data).toEqual([]);
      });
    });

    describe("Failure Cases: Search Supplies", () => {
      // beforeEach(async () => {
      //   validToken = await preSaveUserAndGenJWT();
      // });

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
        expect(response.body.message).toBe("Internal Server Error");
      });
    });
  });

  describe(`POST ${apiSupplyMain}`, () => {
    // let validToken: string;

    describe("Success Cases: Create Supply", () => {
      // beforeEach(async () => {
      //   validToken = await preSaveUserAndGenJWT();
      // });

      it("Creates a new supply with valid data and token", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyComplete);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Supply created successfully");
        expect(response.body.data.supplyID).toBe(validSupplyComplete.supplyID);
        expect(response.body.createdAt).toBeDefined();
      });
    });

    describe("Failure Cases: Create Supply", () => {
      beforeEach(async () => {
        // validToken = await preSaveUserAndGenJWT();
        await Supply.create(validSupplyComplete); // Pre-create for duplicate test
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .send(validSupplyComplete);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when supplyID is duplicate", async () => {
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validSupplyComplete);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Supply ID already exists");
      });

      it("Returns 400 when invalid data is sent", async () => {
        const invalidSupply = { ...validSupplyMinimum, supplyID: undefined };
        const response = await request(app)
          .post(apiSupplyMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidSupply);

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

  describe(`DELETE ${apiSupplyID(":supplyID")}`, () => {
    // let validToken: string;
    let existingSupplyID: string;

    describe("Success Cases: Delete Supply", () => {
      beforeEach(async () => {
        // validToken = await preSaveUserAndGenJWT();
        await preSaveSupply();
        existingSupplyID = validSupplyComplete.supplyID;
      });

      it("Deletes an existing supply with valid token and supplyID", async () => {
        const response = await request(app)
          .delete(apiSupplyID(existingSupplyID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Supply deleted successfully");
        expect(response.body.data.supplyID).toBe(existingSupplyID);

        const deletedSupply = await Supply.findOne({
          supplyID: existingSupplyID,
        });
        expect(deletedSupply).toBeNull();
      });
    });

    describe("Failure Cases: Delete Supply", () => {
      // beforeEach(async () => {
      //   validToken = await preSaveUserAndGenJWT();
      // });

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
});
