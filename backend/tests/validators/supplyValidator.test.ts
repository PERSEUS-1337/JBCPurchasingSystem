import {
  supplySchema,
} from "../../src/validators/supplyValidator";
import { describe, expect, it } from "@jest/globals";
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

describe("Supply Validator", () => {
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
        expect(resultData.supplierPricing).toEqual(
          validSupplyComplete.supplierPricing
        );
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
        expect(resultData.supplierPricing).toEqual(validSupplyMinimum.supplierPricing); // Default value
        expect(resultData.specifications).toEqual([]); // Default value
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
          `Validation error: Required at \"supplyID\"; Required at \"description\"; Required at \"categories\"; Required at \"unitMeasure\"; Required at \"suppliers\"`
        );
      }
    });

    it("Should fail if `specifications` contain invalid data", () => {
      const result = supplySchema.safeParse(invalidSupplyInvalidSpecification);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Validation error: Specification property is required at \"specifications[0].specProperty\"; Required at \"specifications[0].specValue\"`
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
          `Invalid ObjectId format at "supplierPricing[0].supplier"`
        );
        expect(errorMessage).toContain(
          `Price must be a positive number at "supplierPricing[0].price"`
        );
      }
    });

    it("Should fail if `status` is not in supplyStatusEnums", () => {
      const result = supplySchema.safeParse(invalidSupplyStatus);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          `Invalid enum value. Expected 'Active' | 'Inactive', received 'Invalid' at "status"`
        );
      }
    });
  });
});
