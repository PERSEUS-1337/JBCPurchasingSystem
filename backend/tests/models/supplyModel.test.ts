import mongoose from "mongoose";
import Supply from "../../src/models/supplyModel";
import Supplier from "../../src/models/supplierModel";
import {
  validSupplyComplete,
  validSupplyMinimum,
  validSuppliesList,
  invalidSupplyComplete,
  invalidSupplyInvalidSpecification,
  invalidSupplyInvalidSupplierPricing,
  invalidSupplyStatus,
  invalidSupplySupplierPricing,
  validUpdateSupply,
  validPartialUpdateSupply,
  invalidUpdateSupply,
} from "../setup/mockSupplies";
import { validSuppliersList } from "../setup/mockSuppliers";
import {
  connectDB,
  disconnectDB,
  clearCollection,
  preSaveMultipleSuppliers,
  saveSupplyAndReturn,
} from "../setup/globalSetupHelper";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

describe("Supply Model Validation", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Clear both collections
    await clearCollection(Supply);
    await clearCollection(Supplier);

    // Save suppliers first since supplies depend on them
    await preSaveMultipleSuppliers();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: Supply Creation and Validation", () => {
    it("should save a supply with complete data", async () => {
      const savedSupply = await saveSupplyAndReturn(validSupplyComplete);
      expect(savedSupply._id).toBeDefined();
      expect(savedSupply.supplyID).toBe(validSupplyComplete.supplyID);
      expect(savedSupply.name).toBe(validSupplyComplete.name);
      expect(savedSupply.supplierPricing).toHaveLength(2);
    });

    it("should save a supply with minimal required fields", async () => {
      const savedSupply = await saveSupplyAndReturn(validSupplyMinimum);
      expect(savedSupply._id).toBeDefined();
      expect(savedSupply.supplyID).toBe(validSupplyMinimum.supplyID);
      expect(savedSupply.name).toBe(validSupplyMinimum.name);
      expect(savedSupply.supplierPricing).toHaveLength(1);
    });

    it("should save multiple supplies", async () => {
      const savedSupplies = await Promise.all(
        validSuppliesList.map((supply) => saveSupplyAndReturn(supply))
      );
      expect(savedSupplies).toHaveLength(validSuppliesList.length);
      savedSupplies.forEach((supply, index) => {
        expect(supply._id).toBeDefined();
        expect(supply.supplyID).toBe(validSuppliesList[index].supplyID);
        expect(supply.name).toBe(validSuppliesList[index].name);
      });
    });
  });

  describe("Fail Cases: Supply Validation and Error Handling", () => {
    it("should reject a supply with missing required fields", async () => {
      const supply = new Supply({});
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with invalid supplier pricing", async () => {
      const supply = new Supply(invalidSupplyInvalidSupplierPricing);
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with invalid specifications", async () => {
      const supply = new Supply(invalidSupplyInvalidSpecification);
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with invalid status", async () => {
      const supply = new Supply(invalidSupplyStatus);
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with non-array supplier pricing", async () => {
      const supply = new Supply(invalidSupplySupplierPricing);
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with non-existent supplier", async () => {
      const supply = new Supply({
        ...validSupplyMinimum,
        suppliers: [new mongoose.Types.ObjectId()],
        supplierPricing: [
          {
            supplier: new mongoose.Types.ObjectId(),
            price: 50.0,
            priceValidity: new Date("2024-12-31"),
            unitQuantity: 1,
            unitPrice: 50.0,
          },
        ],
      });
      await expect(supply.save()).rejects.toThrow();
    });

    it("should reject a supply with duplicate suppliers in pricing", async () => {
      const supply = new Supply({
        ...validSupplyMinimum,
        supplierPricing: [
          {
            supplier: validSupplyMinimum.suppliers[0],
            price: 50.0,
            priceValidity: new Date("2024-12-31"),
            unitQuantity: 1,
            unitPrice: 50.0,
          },
          {
            supplier: validSupplyMinimum.suppliers[0],
            price: 60.0,
            priceValidity: new Date("2024-12-31"),
            unitQuantity: 1,
            unitPrice: 60.0,
          },
        ],
      });
      await expect(supply.save()).rejects.toThrow();
    });
  });

  describe("Update Cases: Supply Modification", () => {
    let savedSupply: any;

    beforeEach(async () => {
      savedSupply = await saveSupplyAndReturn(validSupplyMinimum);
    });

    it("should update a supply with valid data", async () => {
      const updatedSupply = await Supply.findByIdAndUpdate(
        savedSupply._id,
        validUpdateSupply,
        { new: true }
      );
      expect(updatedSupply?.name).toBe(validUpdateSupply.name);
      expect(updatedSupply?.description).toBe(validUpdateSupply.description);
      expect(updatedSupply?.categories).toEqual(validUpdateSupply.categories);
    });

    it("should update a supply with partial data", async () => {
      const updatedSupply = await Supply.findByIdAndUpdate(
        savedSupply._id,
        validPartialUpdateSupply,
        { new: true }
      );
      expect(updatedSupply?.description).toBe(
        validPartialUpdateSupply.description
      );
      expect(updatedSupply?.name).toBe(savedSupply.name);
    });
    it("should reject invalid updates", async () => {
      await expect(
        Supply.findByIdAndUpdate(savedSupply._id, invalidUpdateSupply, {
          new: true,
          runValidators: true // Add this option to enforce validation on update
        })
      ).rejects.toThrow();
    });
  });
});
