import request from "supertest";
import mongoose from "mongoose";
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
  preSaveUserAndGenJWT,
  saveAndReturn,
} from "../setup/globalSetupHelper";
import PurchaseRequest from "../../src/models/prModel";
import PRItem from "../../src/models/prItemModel";
import {
  validPRComplete,
  validPRMinimum,
  validPRUpdate,
  missingRequiredFieldsPR,
} from "../setup/mockPRs";
import {
  validPRItemComplete,
  validPRItemUpdate,
  missingRequiredFieldsPRItem,
} from "../setup/mockPRItems";
import {
  apiPurchaseRequestMain,
  apiPurchaseRequestHello,
  apiPurchaseRequestID,
  apiPurchaseRequestStatus,
} from "../setup/refRoutes";

// Helper functions for PR routes
const apiPurchaseRequestItems = (prID: string) => `/api/pr/${prID}/items`;
const apiPurchaseRequestItemID = (prID: string, itemID: string) =>
  `/api/pr/${prID}/items/${itemID}`;
const apiPurchaseRequestCancel = (prID: string) => `/api/pr/${prID}/cancel`;

describe("Purchase Request Routes", () => {
  let validToken: string;
  let validPRID: string;
  let validItemID: string;

  beforeAll(async () => {
    await connectDB();
    validToken = await preSaveUserAndGenJWT();
  });

  beforeEach(async () => {
    await clearCollection(PurchaseRequest);
    await clearCollection(PRItem);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // Helper function to create a PR and return its ID
  const createValidPR = async (prData: any = validPRComplete) => {
    const pr = await saveAndReturn(PurchaseRequest, prData);
    return pr.prID;
  };

  // Helper function to create a PR Item
  const createValidPRItem = async (itemData: any = validPRItemComplete) => {
    const item = await saveAndReturn(PRItem, itemData);
    return item;
  };

  describe(`GET ${apiPurchaseRequestHello}`, () => {
    describe("Success Cases: Hello endpoint", () => {
      it("Returns welcome message without authentication", async () => {
        const response = await request(app).get(apiPurchaseRequestHello);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "This is the public purchase request route",
        );
      });
    });
  });

  describe(`GET ${apiPurchaseRequestMain}`, () => {
    describe("Success Cases: GET all purchase requests", () => {
      it("Returns all purchase requests when accessed with a valid token", async () => {
        await createValidPR(validPRComplete);
        await createValidPR({ ...validPRMinimum, prID: "PR-003" });

        const response = await request(app)
          .get(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination).toBeDefined();
      });

      it("Returns empty data when no purchase requests exist", async () => {
        const response = await request(app)
          .get(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });

      it("Returns filtered purchase requests by status", async () => {
        await createValidPR(validPRComplete); // Approved
        await createValidPR(validPRMinimum); // Draft

        const response = await request(app)
          .get(`${apiPurchaseRequestMain}?status=Draft`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].prStatus).toBe("Draft");
      });

      it("Returns paginated results", async () => {
        await createValidPR({ ...validPRComplete, prID: "PR-001" });
        await createValidPR({ ...validPRMinimum, prID: "PR-002" });
        await createValidPR({
          ...validPRComplete,
          prID: "PR-003",
          projCode: "PC-003",
        });

        const response = await request(app)
          .get(`${apiPurchaseRequestMain}?page=1&limit=2`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.totalPages).toBe(2);
      });
    });

    describe("Failure Cases: GET all purchase requests", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiPurchaseRequestMain);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        const mockFind = jest
          .spyOn(PurchaseRequest, "find")
          .mockImplementation(() => {
            throw new Error("Database error");
          });

        const response = await request(app)
          .get(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");

        mockFind.mockRestore();
      });
    });
  });

  describe(`GET ${apiPurchaseRequestID(":prID")}`, () => {
    describe("Success Cases: GET purchase request by ID", () => {
      it("Returns the specified purchase request when accessed with a valid token", async () => {
        validPRID = await createValidPR();

        const response = await request(app)
          .get(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.prID).toBe(validPRID);
      });
    });

    describe("Failure Cases: GET purchase request by ID", () => {
      it("Returns 404 when purchase request does not exist", async () => {
        const response = await request(app)
          .get(apiPurchaseRequestID("nonexistentPR"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(apiPurchaseRequestID("anyid"));

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        const mockFindOne = jest
          .spyOn(PurchaseRequest, "findOne")
          .mockImplementation(() => {
            throw new Error("Database error");
          });

        const response = await request(app)
          .get(apiPurchaseRequestID("validID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");

        mockFindOne.mockRestore();
      });
    });
  });

  describe(`POST ${apiPurchaseRequestMain}`, () => {
    describe("Success Cases: Create purchase request", () => {
      it("Creates a new purchase request with valid complete data and token", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRComplete);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
          "Purchase request created successfully",
        );
        expect(response.body.data.prID).toBe(validPRComplete.prID);
      });

      it("Creates a new purchase request with valid minimum data and token", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRMinimum);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
          "Purchase request created successfully",
        );
        expect(response.body.data.prID).toBe(validPRMinimum.prID);
      });
    });

    describe("Failure Cases: Create purchase request", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .send(validPRComplete);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 409 when prID is duplicate", async () => {
        await createValidPR(validPRComplete);

        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRComplete);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe(
          "Purchase request with this ID already exists",
        );
      });

      it("Returns 400 when invalid data is sent", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(missingRequiredFieldsPR);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
      });

      it("Returns 500 when there's a server error", async () => {
        jest
          .spyOn(PurchaseRequest.prototype, "save")
          .mockImplementationOnce(() => {
            throw new Error("Database error");
          });

        const response = await request(app)
          .post(apiPurchaseRequestMain)
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRMinimum);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PUT ${apiPurchaseRequestID(":prID")}`, () => {
    describe("Success Cases: Update purchase request", () => {
      it("Updates an existing purchase request with valid update data and token", async () => {
        validPRID = await createValidPR(validPRMinimum);

        const response = await request(app)
          .put(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Purchase request updated successfully",
        );
        expect(response.body.data.projName).toBe(validPRUpdate.projName);
      });
    });

    describe("Failure Cases: Update purchase request", () => {
      it("Returns 404 when purchase request is not found", async () => {
        const response = await request(app)
          .put(apiPurchaseRequestID("nonExistingPRID"))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRUpdate);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .put(apiPurchaseRequestID("anyid"))
          .send(validPRUpdate);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there's a server error", async () => {
        jest
          .spyOn(PurchaseRequest, "findOneAndUpdate")
          .mockImplementationOnce(() => {
            throw new Error("Database error");
          });

        validPRID = await createValidPR(validPRMinimum);

        const response = await request(app)
          .put(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRUpdate);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PATCH ${apiPurchaseRequestStatus(":prID")}`, () => {
    describe("Success Cases: Update purchase request status", () => {
      it("Updates purchase request status successfully with a valid token", async () => {
        validPRID = await createValidPR({
          ...validPRMinimum,
          itemsRequested: [new mongoose.Types.ObjectId()],
          totalCost: 100,
        });
        const statusUpdate = {
          prStatus: "Submitted",
        };

        const response = await request(app)
          .patch(apiPurchaseRequestStatus(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(statusUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Purchase request status updated successfully",
        );
        expect(response.body.data.prStatus).toBe(statusUpdate.prStatus);
      });
    });

    describe("Failure Cases: Update purchase request status", () => {
      it("Returns 400 for invalid status transition", async () => {
        validPRID = await createValidPR(validPRComplete); // Approved

        const response = await request(app)
          .patch(apiPurchaseRequestStatus(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ prStatus: "Submitted" });

        expect(response.status).toBe(400);
      });

      it("Returns 404 if the purchase request is not found", async () => {
        const response = await request(app)
          .patch(apiPurchaseRequestStatus("non-existing-id"))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ prStatus: "Submitted" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .patch(apiPurchaseRequestStatus("anyid"))
          .send({ prStatus: "Submitted" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(PurchaseRequest, "findOneAndUpdate")
          .mockImplementationOnce(() => {
            throw new Error("Database error");
          });

        validPRID = await createValidPR({
          ...validPRMinimum,
          itemsRequested: [new mongoose.Types.ObjectId()],
          totalCost: 100,
        });

        const response = await request(app)
          .patch(apiPurchaseRequestStatus(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ prStatus: "Submitted" });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`DELETE ${apiPurchaseRequestID(":prID")}`, () => {
    describe("Success Cases: Delete purchase request", () => {
      it("Deletes an existing purchase request with valid token and prID", async () => {
        validPRID = await createValidPR(validPRMinimum);

        const response = await request(app)
          .delete(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Purchase request and associated items deleted successfully",
        );

        // Verify deletion
        const deletedPR = await PurchaseRequest.findOne({ prID: validPRID });
        expect(deletedPR).toBeNull();
      });
    });

    describe("Failure Cases: Delete purchase request", () => {
      it("Returns 400 when trying to delete a submitted/approved PR", async () => {
        validPRID = await createValidPR(validPRComplete);

        const response = await request(app)
          .delete(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(400);
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).delete(
          apiPurchaseRequestID("anyid"),
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when prID does not exist", async () => {
        const response = await request(app)
          .delete(apiPurchaseRequestID("nonexistent123"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 500 when there's a server error", async () => {
        validPRID = await createValidPR(validPRMinimum);

        jest.spyOn(PurchaseRequest, "findOne").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        const response = await request(app)
          .delete(apiPurchaseRequestID(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PATCH ${apiPurchaseRequestCancel(":prID")}`, () => {
    describe("Success Cases: Cancel purchase request", () => {
      it("Cancels a draft PR with a reason", async () => {
        validPRID = await createValidPR(validPRMinimum);

        const response = await request(app)
          .patch(apiPurchaseRequestCancel(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            cancellationReason: "Request no longer needed",
            cancelledBy: "User2",
          });

        expect(response.status).toBe(200);
        expect(response.body.data.prStatus).toBe("Cancelled");
      });
    });

    describe("Failure Cases: Cancel purchase request", () => {
      it("Returns 400 when cancellation reason is missing", async () => {
        validPRID = await createValidPR(validPRMinimum);

        const response = await request(app)
          .patch(apiPurchaseRequestCancel(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ cancelledBy: "User2" });

        expect(response.status).toBe(400);
      });

      it("Returns 404 when PR is not found", async () => {
        const response = await request(app)
          .patch(apiPurchaseRequestCancel("unknown-pr"))
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            cancellationReason: "No longer needed",
            cancelledBy: "User2",
          });

        expect(response.status).toBe(404);
      });
    });
  });

  // ===== PR ITEM ROUTES =====

  describe(`GET ${apiPurchaseRequestItems(":prID")}`, () => {
    describe("Success Cases: Get all items for a purchase request", () => {
      it("Returns all items for a valid purchase request", async () => {
        validPRID = await createValidPR();
        await createValidPRItem({ ...validPRItemComplete, prID: validPRID });
        await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
          prItemID: "PRI-002",
        });

        const response = await request(app)
          .get(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
      });

      it("Returns empty array when no items exist for a purchase request", async () => {
        validPRID = await createValidPR();

        const response = await request(app)
          .get(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });
    });

    describe("Failure Cases: Get all items for a purchase request", () => {
      it("Returns 404 when purchase request does not exist", async () => {
        const response = await request(app)
          .get(apiPurchaseRequestItems("nonexistent123"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).get(
          apiPurchaseRequestItems("anyid"),
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there is a server error", async () => {
        jest
          .spyOn(PurchaseRequest, "findOne")
          .mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get(apiPurchaseRequestItems("validID"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`POST ${apiPurchaseRequestItems(":prID")}`, () => {
    describe("Success Cases: Add item to purchase request", () => {
      it("Adds a new item to an existing purchase request", async () => {
        validPRID = await createValidPR();
        const itemData = { ...validPRItemComplete, prID: validPRID };

        const response = await request(app)
          .post(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(itemData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
          "Item added to purchase request successfully",
        );
        expect(response.body.data.prItemID).toBe(itemData.prItemID);
      });
    });

    describe("Failure Cases: Add item to purchase request", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestItems("anyid"))
          .send({});

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when purchase request does not exist", async () => {
        const response = await request(app)
          .post(apiPurchaseRequestItems("nonexistent123"))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRItemComplete);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 400 when invalid item data is provided", async () => {
        validPRID = await createValidPR();

        const response = await request(app)
          .post(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(missingRequiredFieldsPRItem);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(PRItem.prototype, "save").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        validPRID = await createValidPR();
        const itemData = { ...validPRItemComplete, prID: validPRID };

        const response = await request(app)
          .post(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(itemData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PUT ${apiPurchaseRequestItemID(":prID", ":itemID")}`, () => {
    describe("Success Cases: Update purchase request item", () => {
      it("Updates an existing item in a purchase request", async () => {
        validPRID = await createValidPR();
        const item = await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
        });
        validItemID = item.prItemID;

        const response = await request(app)
          .put(apiPurchaseRequestItemID(validPRID, validItemID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRItemUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Item updated successfully");
        expect(response.body.data.itemDescription).toBe(
          validPRItemUpdate.itemDescription,
        );
      });
    });

    describe("Failure Cases: Update purchase request item", () => {
      it("Returns 404 when item is not found", async () => {
        validPRID = await createValidPR();

        const response = await request(app)
          .put(apiPurchaseRequestItemID(validPRID, "nonexistent-item"))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRItemUpdate);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
          "Item not found in this purchase request",
        );
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .put(apiPurchaseRequestItemID("anyid", "anyitem"))
          .send({});

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(PRItem, "findOneAndUpdate").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        validPRID = await createValidPR();
        const item = await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
        });
        validItemID = item.prItemID;

        const response = await request(app)
          .put(apiPurchaseRequestItemID(validPRID, validItemID))
          .set("Authorization", `Bearer ${validToken}`)
          .send(validPRItemUpdate);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`DELETE ${apiPurchaseRequestItemID(":prID", ":itemID")}`, () => {
    describe("Success Cases: Remove item from purchase request", () => {
      it("Removes an item from an existing purchase request", async () => {
        validPRID = await createValidPR();
        const item = await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
        });
        validItemID = item.prItemID;

        const response = await request(app)
          .delete(apiPurchaseRequestItemID(validPRID, validItemID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
          "Item removed from purchase request successfully",
        );

        // Verify deletion
        const deletedItem = await PRItem.findOne({
          prItemID: validItemID,
          prID: validPRID,
        });
        expect(deletedItem).toBeNull();
      });
    });

    describe("Failure Cases: Remove item from purchase request", () => {
      it("Returns 401 when no token is provided", async () => {
        const response = await request(app).delete(
          apiPurchaseRequestItemID("anyid", "anyitem"),
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 404 when item is not found", async () => {
        validPRID = await createValidPR();

        const response = await request(app)
          .delete(apiPurchaseRequestItemID(validPRID, "nonexistent-item"))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
          "Item not found in this purchase request",
        );
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(PRItem, "findOneAndDelete").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        validPRID = await createValidPR();
        const item = await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
        });
        validItemID = item.prItemID;

        const response = await request(app)
          .delete(apiPurchaseRequestItemID(validPRID, validItemID))
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });

  describe(`PUT ${apiPurchaseRequestItems(":prID")}`, () => {
    describe("Success Cases: Bulk update purchase request items", () => {
      it("Replaces all items in a purchase request", async () => {
        validPRID = await createValidPR();

        // Add initial items
        await createValidPRItem({ ...validPRItemComplete, prID: validPRID });
        await createValidPRItem({
          ...validPRItemComplete,
          prID: validPRID,
          prItemID: "PRI-002",
        });

        const newItems = [
          { ...validPRItemComplete, prItemID: "PRI-NEW-001", prID: validPRID },
          { ...validPRItemComplete, prItemID: "PRI-NEW-002", prID: validPRID },
        ];

        const response = await request(app)
          .put(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ items: newItems });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Items updated successfully");
        expect(response.body.data).toHaveLength(2);
        expect(
          response.body.data.some(
            (item: any) => item.prItemID === "PRI-NEW-001",
          ),
        ).toBe(true);
      });
    });

    describe("Failure Cases: Bulk update purchase request items", () => {
      it("Returns 404 when purchase request does not exist", async () => {
        const response = await request(app)
          .put(apiPurchaseRequestItems("nonexistent123"))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ items: [validPRItemComplete] });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Purchase request not found");
      });

      it("Returns 401 when no token is provided", async () => {
        const response = await request(app)
          .put(apiPurchaseRequestItems("anyid"))
          .send({ items: [] });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access denied: No token provided");
      });

      it("Returns 500 when there's a server error", async () => {
        jest.spyOn(PRItem, "deleteMany").mockImplementationOnce(() => {
          throw new Error("Database error");
        });

        validPRID = await createValidPR();

        const response = await request(app)
          .put(apiPurchaseRequestItems(validPRID))
          .set("Authorization", `Bearer ${validToken}`)
          .send({ items: [validPRItemComplete] });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
      });
    });
  });
});
