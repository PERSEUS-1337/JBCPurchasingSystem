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
import { apiSupplyID, apiSupplyMain, apiSupplySearch } from "../setup/refRoutes";


// // API Endpoints
// const apiSupplyMain = "/api/supplies";
// const apiSupplySearch = "/api/supplies/search";
// const apiSupplyID = (id: string) => `/api/supplies/${id}`;

// // Test Helpers
// const preSaveUserAndGenJWT = async (): Promise<string> => {
//   const user = await User.create({
//     username: "testuser",
//     password: "testpass",
//     role: "procurement",
//   });
//   return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
//     expiresIn: "1h",
//   });
// };

// const preSaveSupply = async () => {
//   await Supply.create(validSupplyMinimum);
// };

// const preSaveMultipleSupplies = async () => {
//   await Supply.create([validSupplyComplete, validSupplyMinimum]);
// };

// const deleteSupplies = async () => {
//   await Supply.deleteMany({});
// };

describe("Supply Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiSupplyID(":supplyID")}`, () => {
    let validToken: string;
    let validSupplyID: string;

    describe("Success Cases: GET supplies by ID", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
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
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
      });

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
    let validToken: string;

    describe("Success Cases: GET all supplies", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
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
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
      });

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
    let validToken: string;

    describe("Success Cases: Search Supplies", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
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
    });

    describe("Failure Cases: Search Supplies", () => {
      beforeEach(async () => {
        validToken = await preSaveUserAndGenJWT();
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(
          `${apiSupplySearch}?query=Bolt`
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 400 when no query parameter", async () => {
        const response = await request(app)
          .get(apiSupplySearch)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Search query is required");
      });

      it("Returns 404 when no matches found", async () => {
        const response = await request(app)
          .get(`${apiSupplySearch}?query=NonExistent`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No supplies matched your search");
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
});
