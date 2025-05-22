import mongoose from "mongoose";
import PurchaseRequest from "../../src/models/prModel";
import {
  validPurchaseRequestComplete,
  validPurchaseRequestMinimum,
  // validPurchaseRequestsList,
  // Note: These seem unused based on the current file content. Keeping them commented for now.
  // invalidPRMissingFields, // Assuming this should map to missingRequiredFieldsPR if needed
  // invalidPRDuplicatePRItemIDs, // No direct equivalent found in mockPurchaseRequests.ts exports
  // invalidPRMissingPRItems, // Assuming this should map to invalidPurchaseRequestItems if needed
  // invalidPRInvalidDataTypes, // Assuming this should map to invalidPurchaseRequestComplete (as it contains invalid types) or create a specific mock
  validUpdatePurchaseRequest,
  validPartialUpdatePurchaseRequest,
  invalidUpdatePurchaseRequest,
} from "../setup/mockPurchaseRequests";
import {
  connectDB,
  disconnectDB,
  clearCollection,
  saveAndReturn, // Corrected import name
} from "../setup/globalSetupHelper";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

describe("Purchase Request Model Validation", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Clear the purchase_requests collection before each test
    await clearCollection(PurchaseRequest);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: Purchase Request Creation and Validation", () => {
    it("should save a purchase request with complete data", async () => {
      const savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestComplete
      );
      expect(savedPR._id).toBeDefined();
      expect(savedPR.prRefNumber).toBe(
        validPurchaseRequestComplete.prRefNumber
      );

      // Verify totalCost is computed correctly from PR items
      const expectedTotalCost =
        validPurchaseRequestComplete.itemsRequested.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
      expect(savedPR.totalCost).toBe(expectedTotalCost);
    });

    it("should save a purchase request with minimal required fields", async () => {
      const savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestMinimum
      );
      expect(savedPR._id).toBeDefined();
      expect(savedPR.prRefNumber).toBe(validPurchaseRequestMinimum.prRefNumber);

      const expectedTotalCost =
        validPurchaseRequestMinimum.itemsRequested.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
      expect(savedPR.totalCost).toBe(expectedTotalCost);
    });

    it("should save multiple purchase requests", async () => {
      const savedPRs = await Promise.all(
        validPurchaseRequestsList.map((pr) =>
          saveAndReturn(PurchaseRequest, pr)
        )
      );
      expect(savedPRs).toHaveLength(validPurchaseRequestsList.length);
      savedPRs.forEach((pr, index) => {
        expect(pr._id).toBeDefined();
        expect(pr.prRefNumber).toBe(
          validPurchaseRequestsList[index].prRefNumber
        );
      });
    });
  });

  describe("Fail Cases: Purchase Request Validation and Error Handling", () => {
    it("should reject a purchase request with missing required fields", async () => {
      const pr = new PurchaseRequest({});
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with missing PR items", async () => {
      const invalidPR = { ...validPurchaseRequestComplete, itemsRequested: [] };
      const pr = new PurchaseRequest(invalidPR);
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with duplicate PR item IDs", async () => {
      const invalidPR = JSON.parse(
        JSON.stringify(validPurchaseRequestComplete)
      );
      // Force duplicate prItemID in the itemsRequested array.
      invalidPR.itemsRequested[1].prItemID =
        invalidPR.itemsRequested[0].prItemID;
      const pr = new PurchaseRequest(invalidPR);
      await expect(pr.save()).rejects.toThrow();
    });

    it("should reject a purchase request with invalid data types", async () => {
      const invalidPR = JSON.parse(
        JSON.stringify(validPurchaseRequestComplete)
      );
      // Provide an invalid data type for quantity (should be a number)
      invalidPR.itemsRequested[0].quantity = "not a number";
      const pr = new PurchaseRequest(invalidPR);
      await expect(pr.save()).rejects.toThrow();
    });
  });

  describe("Update Cases: Purchase Request Modification", () => {
    let savedPR: any;

    beforeEach(async () => {
      savedPR = await saveAndReturn(
        PurchaseRequest,
        validPurchaseRequestMinimum
      );
    });

    it("should update a purchase request with valid data", async () => {
      const updatedData = {
        projName: validUpdatePurchaseRequest.projName,
        justification: validUpdatePurchaseRequest.justification,
      };
      const updatedPR = await PurchaseRequest.findByIdAndUpdate(
        savedPR._id,
        updatedData,
        { new: true, runValidators: true }
      );
      expect(updatedPR?.projName).toBe(updatedData.projName);
      expect(updatedPR?.justification).toBe(updatedData.justification);
    });

    it("should recalculate totalCost on PR update", async () => {
      // Modify one of the PR items (e.g., change quantity)
      const newItems = [...savedPR.itemsRequested];
      newItems[0].quantity = 10; // Update quantity
      // Remove manual totalPrice calculation; it will be handled in the pre-save hook

      const updatedPR = await PurchaseRequest.findByIdAndUpdate(
        savedPR._id,
        { itemsRequested: newItems },
        { new: true, runValidators: true }
      );

      // Calculate expected total cost based on updated items
      const expectedTotalCost = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity, // Calculate totalPrice based on unitPrice and quantity
        0
      );

      // Assert that the updated totalCost matches the expected total cost
      expect(updatedPR?.totalCost).toBe(expectedTotalCost);
    });

    it("should reject invalid updates", async () => {
      await expect(
        PurchaseRequest.findByIdAndUpdate(
          savedPR._id,
          invalidUpdatePurchaseRequest,
          {
            new: true,
            runValidators: true,
          }
        )
      ).rejects.toThrow();
    });

    it("should update a purchase request with partial data", async () => {
      const updatedPR = await PurchaseRequest.findByIdAndUpdate(
        savedPR._id,
        validPartialUpdatePurchaseRequest,
        { new: true, runValidators: true }
      );
      // Expect updated field to change while others remain unchanged
      expect(updatedPR?.justification).toBe(
        validPartialUpdatePurchaseRequest.justification
      );
      expect(updatedPR?.projCode).toBe(savedPR.projCode);
    });
  });

  describe("Edge Cases: Purchase Request Validation", () => {
    it("should reject a purchase request with invalid data types", async () => {
      const invalidPR = JSON.parse(
        JSON.stringify(validPurchaseRequestComplete)
      );
      invalidPR.itemsRequested[0].unitPrice = "invalidPrice"; // Invalid unitPrice
      const pr = new PurchaseRequest(invalidPR);
      await expect(pr.save()).rejects.toThrow();
    });
  });

  describe("Concurrency: Purchase Request Operations", () => {
    it("should handle concurrent saves without errors", async () => {
      const savePromises = validPurchaseRequestsList.map((pr) =>
        saveAndReturn(PurchaseRequest, pr)
      );
      await expect(Promise.all(savePromises)).resolves.not.toThrow();
    });
  });

  describe("Performance: Bulk Operations", () => {
    it("should save multiple purchase requests quickly", async () => {
      const startTime = Date.now();
      const savePromises = validPurchaseRequestsList.map((pr) =>
        saveAndReturn(PurchaseRequest, pr)
      );
      await Promise.all(savePromises);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Expect to save within 2 seconds
    });
  });
});
