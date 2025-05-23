import mongoose from "mongoose";
import PRItem from "../../src/models/prItemModel";
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

const validPRItem = {
  prItemID: "PRI-001",
  prID: "PR-001",
  supplyID: "SUP-001",
  supplierID: "SUPPLIER-001",
  itemDescription: "Test Item",
  quantity: 5,
  unitOfMeasurement: "pcs",
  unitPrice: 100,
  // totalPrice will be calculated by pre-save hook
  deliveryAddress: "123 Test St",
};

const validPRItem2 = {
  prItemID: "PRI-002",
  prID: "PR-001",
  supplyID: "SUP-002",
  supplierID: "SUPPLIER-002",
  itemDescription: "Another Item",
  quantity: 2,
  unitOfMeasurement: "box",
  unitPrice: 250,
  deliveryAddress: "456 Test Ave",
};

const invalidPRItemMissingFields = {
  prItemID: "PRI-003",
  // Missing required fields
};

const invalidPRItemWrongType = {
  ...validPRItem,
  quantity: "not a number", // Should be a number
};

const duplicatePRItem = {
  ...validPRItem,
  prItemID: "PRI-001", // Same as validPRItem
};

describe("PRItem Model", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearCollection(PRItem);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases", () => {
    it("should save a PRItem and calculate totalPrice", async () => {
      const savedItem = await saveAndReturn(PRItem, validPRItem);
      expect(savedItem._id).toBeDefined();
      expect(savedItem.prItemID).toBe(validPRItem.prItemID);
      expect(savedItem.totalPrice).toBe(
        validPRItem.quantity * validPRItem.unitPrice
      );
    });

    it("should save another valid PRItem", async () => {
      const savedItem = await saveAndReturn(PRItem, validPRItem2);
      expect(savedItem._id).toBeDefined();
      expect(savedItem.prItemID).toBe(validPRItem2.prItemID);
      expect(savedItem.totalPrice).toBe(
        validPRItem2.quantity * validPRItem2.unitPrice
      );
    });

    it("should update a PRItem's quantity and recalculate totalPrice", async () => {
      const savedItem = await saveAndReturn(PRItem, validPRItem);
      const updated = await PRItem.findByIdAndUpdate(
        savedItem._id,
        { quantity: 10 },
        { new: true, runValidators: true }
      );
      // Note: pre-save hook does not run on findByIdAndUpdate, so totalPrice will not update automatically
      // To test the hook, we need to update and then save
      if (updated) {
        updated.quantity = 10;
        await updated.save();
        expect(updated.totalPrice).toBe(10 * validPRItem.unitPrice);
      }
    });
  });

  describe("Fail Cases", () => {
    it("should reject a PRItem with missing required fields", async () => {
      const item = new PRItem(invalidPRItemMissingFields);
      await expect(item.save()).rejects.toThrow();
    });

    it("should reject a PRItem with wrong data type for quantity", async () => {
      const item = new PRItem(invalidPRItemWrongType);
      await expect(item.save()).rejects.toThrow();
    });

    it("should reject a PRItem with duplicate prItemID", async () => {
      await saveAndReturn(PRItem, validPRItem);
      const item = new PRItem(duplicatePRItem);
      await expect(item.save()).rejects.toThrow();
    });
  });
});
