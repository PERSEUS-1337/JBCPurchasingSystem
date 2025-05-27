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
  recommendedBy: "Manager1",
  approvedBy: "Manager2",
  prStatus: "Approved",
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
  recommendedBy: "Manager2",
  approvedBy: undefined,
  prStatus: "Draft",
  totalCost: 0,
};

const validUpdatePurchaseRequest = {
  projName: "Project Alpha Updated",
  justification: "Updated justification.",
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
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        projCode: undefined,
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with wrong data type for totalCost", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        totalCost: "not-a-number",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with invalid prStatus", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        prStatus: "InvalidStatus",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with missing projCode", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        projCode: undefined,
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with missing projName", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        projName: undefined,
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with missing projClient", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        projClient: undefined,
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with missing requestedBy", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        requestedBy: undefined,
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with invalid dateRequested", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        dateRequested: "not-a-date",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with invalid dateRequired", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestComplete,
        dateRequired: "not-a-date",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request that is not a draft that has no itemsRequested", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestMinimum,
        prStatus: "Submitted",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request that is approved that has no recommendedBy", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestMinimum,
        prStatus: "Approved",
      });
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request that is recommended that has no itemsRequested", async () => {
      const pr = new PurchaseRequest({
        ...validPurchaseRequestMinimum,
        prStatus: "Recommended",
      });
      await expect(pr.save()).rejects.toThrow();
    });
  });
});
