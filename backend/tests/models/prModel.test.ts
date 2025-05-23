import mongoose from "mongoose";
import PurchaseRequest from "../../src/models/prModel";
import {
  connectDB,
  disconnectDB,
  clearCollection,
  saveAndReturn,
} from "../setup/globalSetupHelper";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

// Inline mock data for now
const mockObjectId = () => new mongoose.Types.ObjectId();

const validPurchaseRequestComplete = {
  prID: "PR-001",
  projCode: "PC-001",
  projName: "Project Alpha",
  projClient: "Client A",
  dateRequested: new Date(),
  dateRequired: new Date(Date.now() + 86400000),
  requestedBy: "User1",
  approvedBy: "Manager1",
  prStatus: "Submitted",
  itemsRequested: [mockObjectId(), mockObjectId()],
  totalCost: 1000,
  justification: "Need items for project.",
};

const validPurchaseRequestMinimum = {
  prID: "PR-002",
  projCode: "PC-002",
  projName: "Project Beta",
  projClient: "Client B",
  dateRequested: new Date(),
  dateRequired: new Date(Date.now() + 86400000),
  requestedBy: "User2",
  approvedBy: "Manager2",
  prStatus: "Draft",
  // itemsRequested omitted to test optional
  totalCost: 0,
};

const validUpdatePurchaseRequest = {
  projName: "Project Alpha Updated",
  justification: "Updated justification.",
};

const invalidPurchaseRequestMissingFields = {
  // Missing required fields
  prID: "PR-003",
};

const invalidPurchaseRequestWrongType = {
  ...validPurchaseRequestComplete,
  totalCost: "not a number", // Should be a number
};

const invalidPurchaseRequestInvalidStatus = {
  ...validPurchaseRequestComplete,
  prStatus: "NotAStatus", // Not in enum
};

describe("Purchase Request Model", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearCollection(PurchaseRequest);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases", () => {
    it("should save a purchase request with complete data", async () => {
      const savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestComplete
      );
      expect(savedPR._id).toBeDefined();
      expect(savedPR.prID).toBe(validPurchaseRequestComplete.prID);
      expect(savedPR.itemsRequested && savedPR.itemsRequested.length).toBe(2);
      expect(savedPR.totalCost).toBe(validPurchaseRequestComplete.totalCost);
    });

    it("should save a purchase request with minimal required fields (no itemsRequested)", async () => {
      const savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestMinimum
      );
      expect(savedPR._id).toBeDefined();
      expect(savedPR.prID).toBe(validPurchaseRequestMinimum.prID);
      expect(savedPR.itemsRequested).toEqual([]);
      expect(savedPR.totalCost).toBe(validPurchaseRequestMinimum.totalCost);
    });

    it("should update a purchase request with valid data", async () => {
      const savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestComplete
      );
      const updatedPR = await PurchaseRequest.findByIdAndUpdate(
        savedPR._id,
        validUpdatePurchaseRequest,
        { new: true, runValidators: true }
      );
      expect(updatedPR?.projName).toBe(validUpdatePurchaseRequest.projName);
      expect(updatedPR?.justification).toBe(
        validUpdatePurchaseRequest.justification
      );
    });
  });

  describe("Fail Cases", () => {
    it("should reject a purchase request with missing required fields", async () => {
      const pr = new PurchaseRequest(invalidPurchaseRequestMissingFields);
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with wrong data type for totalCost", async () => {
      const pr = new PurchaseRequest(invalidPurchaseRequestWrongType);
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with invalid prStatus", async () => {
      const pr = new PurchaseRequest(invalidPurchaseRequestInvalidStatus);
      await expect(pr.save()).rejects.toThrow();
    });
  });
});
