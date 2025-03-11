import Supply from "../../src/models/supplyModel";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import {
  connectDB,
  disconnectDB,
  dropDB,
  preSaveSupplier,
  saveSupplyAndReturn,
} from "../setup/globalSetupHelper";
import {
  validSupplyComplete,
  validSupplyMinimum,
  missingRequiredFieldsSupply,
  invalidSupplySupplierPricing,
} from "../setup/mockSupplies";

describe("Supply Model Validation", () => {
  beforeAll(async () => {
    await connectDB();
    await Supply.syncIndexes(); // Reapply unique indexes
  });
  

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: Supply Creation and Validation", () => {
    it("Should save a valid complete supply", async () => {
      const savedSupply = await saveSupplyAndReturn(validSupplyComplete);

      expect(savedSupply._id).toBeDefined();
      expect(savedSupply.supplyID).toBe(validSupplyComplete.supplyID);
      expect(savedSupply.name).toBe(validSupplyComplete.name);
      expect(savedSupply.description).toBe(validSupplyComplete.description);
      expect(savedSupply.categories).toEqual(validSupplyComplete.categories);
      expect(savedSupply.unitMeasure).toBe(validSupplyComplete.unitMeasure);
      expect(savedSupply.suppliers).toEqual(validSupplyComplete.suppliers);
      expect(
        savedSupply.supplierPricing.map(({ supplier, price }) => ({
          supplier,
          price,
        }))
      ).toEqual(validSupplyComplete.supplierPricing);
      expect(
        savedSupply.specifications.map(({ specProperty, specValue }) => ({
          specProperty,
          specValue,
        }))
      ).toEqual(validSupplyComplete.specifications);
      expect(savedSupply.status).toBe(validSupplyComplete.status);
      expect(savedSupply.attachments).toEqual(validSupplyComplete.attachments);

      // Should have default timestamps
      expect(savedSupply.createdAt).toBeDefined();
      expect(savedSupply.updatedAt).toBeDefined();
    });

    it("Should allow minimal required fields and default others", async () => {
      await preSaveSupplier();
      const savedSupply = await saveSupplyAndReturn(validSupplyMinimum);
      expect(savedSupply._id).toBeDefined();
      expect(savedSupply.supplyID).toBe(validSupplyMinimum.supplyID);
      expect(savedSupply.name).toBe(validSupplyMinimum.name);
      expect(savedSupply.description).toBe(validSupplyMinimum.description);
      expect(savedSupply.categories).toEqual(validSupplyMinimum.categories);
      expect(savedSupply.unitMeasure).toBe(validSupplyMinimum.unitMeasure);
      expect(savedSupply.suppliers).toEqual(validSupplyMinimum.suppliers);
      expect(
        savedSupply.supplierPricing.map(({ supplier, price }) => ({
          supplier,
          price,
        }))
      ).toEqual(validSupplyMinimum.supplierPricing);
      expect(savedSupply.specifications).toEqual(
        validSupplyMinimum.specifications
      );
      expect(savedSupply.attachments).toEqual(validSupplyMinimum.attachments);

      // Should have default timestamps
      expect(savedSupply.createdAt).toBeDefined();
      expect(savedSupply.updatedAt).toBeDefined();
    });
  });

  // ========= FAIL CASES =========
  describe("Fail Cases: Supply Validation and Error Handling", () => {
    it("Should reject if required fields are missing", async () => {
      const supply = new Supply(missingRequiredFieldsSupply);
      await expect(supply.save({ validateBeforeSave: true })).rejects.toThrow();
    });

    // it("Should enforce valid categories format", async () => {
    //   const supply = new Supply(invalidSupplyCategories);
    //   await expect(supply.save({ validateBeforeSave: true })).rejects.toThrow();
    // });

    it("Should reject invalid supplier pricing structure", async () => {
      const supply = new Supply(invalidSupplySupplierPricing);
      await expect(supply.save({ validateBeforeSave: true })).rejects.toThrow();
    });

    // it("Should enforce unique supplyID", async () => {
    //   await saveSupplyAndReturn(validSupplyComplete);
    //   const duplicateSupply = new Supply(validSupplyComplete);
    //   await expect(
    //     duplicateSupply.save()
    //   ).rejects.toThrow();
    // });
  });
});
