import { supplySchema } from "../../src/validators/supplyValidator";
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import {
  validSupplyComplete,
  missingRequiredFieldsSupply,
  invalidSupplyInvalidSpecification,
  invalidSupplyInvalidSupplierPricing,
  validSupplyMinimum,
  invalidSupplyStatus,
} from "../setup/mockSupplies";
import { fromZodError } from "zod-validation-error";
import { defaultSupplyStatus } from "../../src/constants";
import {
  connectDB,
  disconnectDB,
  clearCollection,
} from "../setup/globalSetupHelper";
import Supply from "../../src/models/supplyModel";
import Supplier from "../../src/models/supplierModel";

describe("Supply Validator", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearCollection(Supply);
    await clearCollection(Supplier);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: Supply Validation", () => {
    it("Should pass with a complete valid supply", () => {
      const result = supplySchema.safeParse(validSupplyComplete);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.supplyID).toBe(validSupplyComplete.supplyID);
        expect(resultData.name).toBe(validSupplyComplete.name);
        expect(resultData.description).toBe(validSupplyComplete.description);
        expect(resultData.categories).toEqual(validSupplyComplete.categories);
        expect(resultData.unitMeasure).toBe(validSupplyComplete.unitMeasure);
        expect(resultData.suppliers).toEqual(validSupplyComplete.suppliers);
        expect(resultData.supplierPricing).toHaveLength(2);
        resultData.supplierPricing.forEach((pricing, index) => {
          expect(pricing.supplier).toBe(
            validSupplyComplete.supplierPricing[index].supplier
          );
          expect(pricing.price).toBe(
            validSupplyComplete.supplierPricing[index].price
          );
          expect(pricing.priceValidity).toBeInstanceOf(Date);
          expect(pricing.unitQuantity).toBe(
            validSupplyComplete.supplierPricing[index].unitQuantity
          );
          expect(pricing.unitPrice).toBe(
            validSupplyComplete.supplierPricing[index].unitPrice
          );
        });
        expect(resultData.specifications).toEqual(
          validSupplyComplete.specifications
        );
        expect(resultData.status).toBe(validSupplyComplete.status);
        expect(resultData.attachments).toEqual(validSupplyComplete.attachments);
      }
    });

    it("Should pass with minimal required fields and default others", () => {
      const result = supplySchema.safeParse(validSupplyMinimum);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.supplyID).toBe(validSupplyMinimum.supplyID);
        expect(resultData.name).toBe(validSupplyMinimum.name);
        expect(resultData.description).toBe(validSupplyMinimum.description);
        expect(resultData.categories).toEqual(validSupplyMinimum.categories);
        expect(resultData.unitMeasure).toBe(validSupplyMinimum.unitMeasure);
        expect(resultData.suppliers).toEqual(validSupplyMinimum.suppliers);
        expect(resultData.supplierPricing).toHaveLength(1);
        const pricing = resultData.supplierPricing[0];
        expect(pricing.supplier).toBe(
          validSupplyMinimum.supplierPricing[0].supplier
        );
        expect(pricing.price).toBe(validSupplyMinimum.supplierPricing[0].price);
        expect(pricing.priceValidity).toBeInstanceOf(Date);
        expect(pricing.unitQuantity).toBe(
          validSupplyMinimum.supplierPricing[0].unitQuantity
        );
        expect(pricing.unitPrice).toBe(
          validSupplyMinimum.supplierPricing[0].unitPrice
        );
        expect(resultData.specifications).toEqual(validSupplyMinimum.specifications); // Default value
        expect(resultData.status).toBe(defaultSupplyStatus); // Default value
        expect(resultData.attachments).toEqual([]); // Default value
      }
    });
  });

  describe("Fail Cases: Supply Validation Errors", () => {
    it("Should fail if required fields are missing", () => {
      const result = supplySchema.safeParse(missingRequiredFieldsSupply);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Required at \"supplyID\"; Required at \"name\"; Required at \"description\"; Required at \"categories\"; Required at \"unitMeasure\"; Required at \"suppliers\"`
        );
      }
    });

    it("Should fail if `specifications` contain invalid data", () => {
      const result = supplySchema.safeParse(invalidSupplyInvalidSpecification);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Expected object, received number at \"specifications[0]\"; Expected object, received boolean at \"specifications[1]\"; Specification property is required at \"specifications[2].specProperty\"`
        );
      }
    });

    it("Should fail if `supplierPricing` contains invalid data", () => {
      const result = supplySchema.safeParse(
        invalidSupplyInvalidSupplierPricing
      );
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Invalid ObjectId format at \"supplierPricing[0].supplier\"; Expected number, received string at \"supplierPricing[1].price\"`
        );
      }
    });

    it("Should fail if `status` is not in supplyStatusEnums", () => {
      const result = supplySchema.safeParse(invalidSupplyStatus);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Invalid enum value. Expected 'Active' | 'Inactive', received 'NotAStatus' at \"status\"`
        );
      }
    });

    it("Should fail if specifications are empty", () => {
      const supplyWithEmptySpecs = {
        ...validSupplyMinimum,
        specifications: [], // Empty specifications
      };
      const result = supplySchema.safeParse(supplyWithEmptySpecs);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Specifications cannot be empty at \"specifications\"`
        );
      }
    });
  });
});
