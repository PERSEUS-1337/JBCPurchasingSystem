import {
  supplySchema,
  supplyUpdateSchema,
} from "../../src/validators/supplyValidator";
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
  validSupplyMinimum,
  missingRequiredFieldsSupply,
  invalidSupplyEmptyStrings,
  invalidSupplyWhitespaceFields,
  invalidSupplyInvalidSpecification,
  invalidSupplyInvalidSupplierPricing,
  invalidSupplyStatus,
  invalidSupplyNonExistentSupplier,
  invalidSupplyDuplicateSuppliers,
  invalidSupplyLargePrice,
  invalidSupplyZeroQuantity,
  invalidSupplyEmptySpecifications,
  invalidSupplyEmptyPricing,
  validSupplyUpdateComplete,
  validSupplyUpdateMinimal,
  validSupplyUpdatePartial,
  emptySupplyUpdate,
  restrictedSupplyUpdate,
  invalidSupplyUpdate,
  invalidSupplyUpdateTypes,
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
        expect(resultData.specifications).toEqual(
          validSupplyMinimum.specifications
        );
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
        expect(errorMessage).toContain('Required at "supplyID"');
        expect(errorMessage).toContain('Required at "name"');
        expect(errorMessage).toContain('Required at "description"');
        expect(errorMessage).toContain('Required at "categories"');
        expect(errorMessage).toContain('Required at "unitMeasure"');
        expect(errorMessage).toContain('Required at "supplierPricing"');
      }
    });

    it("Should fail if string fields are empty", () => {
      const result = supplySchema.safeParse(invalidSupplyEmptyStrings);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Supply ID is required");
        expect(errorMessage).toContain("Name is required");
        expect(errorMessage).toContain("Description is required");
        expect(errorMessage).toContain("Unit of measure is required");
      }
    });

    it("Should fail if string fields contain only whitespace", () => {
      const result = supplySchema.safeParse(invalidSupplyWhitespaceFields);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Supply ID is required");
        expect(errorMessage).toContain("Name is required");
        expect(errorMessage).toContain("Description is required");
        expect(errorMessage).toContain("Unit of measure is required");
      }
    });

    it("Should fail if specifications contain invalid data", () => {
      const result = supplySchema.safeParse(invalidSupplyInvalidSpecification);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Expected object, received number");
        expect(errorMessage).toContain("Expected object, received boolean");
        expect(errorMessage).toContain("Specification property is required");
      }
    });

    it("Should fail if supplierPricing contains invalid data", () => {
      const result = supplySchema.safeParse(
        invalidSupplyInvalidSupplierPricing
      );
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Invalid ObjectId format");
        expect(errorMessage).toContain("Expected number, received string");
      }
    });

    it("Should fail if status is not in supplyStatusEnums", () => {
      const result = supplySchema.safeParse(invalidSupplyStatus);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Invalid enum value");
        expect(errorMessage).toContain("'Active' | 'Inactive'");
        expect(errorMessage).toContain("received 'NotAStatus'");
      }
    });

    it("Should fail if specifications are empty", () => {
      const result = supplySchema.safeParse(invalidSupplyEmptySpecifications);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Specifications cannot be empty");
      }
    });

    it("Should fail if supplier pricing is empty", () => {
      const result = supplySchema.safeParse(invalidSupplyEmptyPricing);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          "Supply must have at least one supplier with pricing"
        );
      }
    });

    it("Should fail if price is extremely large", () => {
      const result = supplySchema.safeParse(invalidSupplyLargePrice);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Price exceeds maximum limit");
      }
    });

    it("Should fail if unit quantity is zero", () => {
      const result = supplySchema.safeParse(invalidSupplyZeroQuantity);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Unit quantity must be at least 1");
      }
    });
  });

  describe("Success Cases: Supply Update Validation", () => {
    it("Should pass with complete valid update data", () => {
      const result = supplyUpdateSchema.safeParse(validSupplyUpdateComplete);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.name).toBe(validSupplyUpdateComplete.name);
        expect(resultData.description).toBe(
          validSupplyUpdateComplete.description
        );
        expect(resultData.categories).toEqual(
          validSupplyUpdateComplete.categories
        );
        expect(resultData.unitMeasure).toBe(
          validSupplyUpdateComplete.unitMeasure
        );
        expect(resultData.status).toBe(validSupplyUpdateComplete.status);
        expect(resultData.attachments).toEqual(
          validSupplyUpdateComplete.attachments
        );
      }
    });

    it("Should pass with minimal update data", () => {
      const result = supplyUpdateSchema.safeParse(validSupplyUpdateMinimal);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.description).toBe(
          validSupplyUpdateMinimal.description
        );
      }
    });

    it("Should pass with partial update data", () => {
      const result = supplyUpdateSchema.safeParse(validSupplyUpdatePartial);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.name).toBe(validSupplyUpdatePartial.name);
        expect(resultData.categories).toEqual(
          validSupplyUpdatePartial.categories
        );
        expect(resultData.status).toBe(validSupplyUpdatePartial.status);
      }
    });
  });

  describe("Fail Cases: Supply Update Validation Errors", () => {
    it("Should fail if update object is empty", () => {
      const result = supplyUpdateSchema.safeParse(emptySupplyUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("At least one field must be updated");
      }
    });

    it("Should fail if restricted fields are being updated", () => {
      const result = supplyUpdateSchema.safeParse(restrictedSupplyUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: supplyID"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: createdAt"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: updatedAt"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: supplierPricing"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: specifications"
        );
      }
    });

    it("Should fail if update data contains validation errors", () => {
      const result = supplyUpdateSchema.safeParse(invalidSupplyUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Name is required");
        expect(errorMessage).toContain("Description is required");
        expect(errorMessage).toContain("At least one category is required");
        expect(errorMessage).toContain("Unit of measure is required");
        expect(errorMessage).toContain("Invalid enum value");
      }
    });

    it("Should fail if update data contains invalid types", () => {
      const result = supplyUpdateSchema.safeParse(invalidSupplyUpdateTypes);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Expected string, received number");
        expect(errorMessage).toContain("Expected array, received string");
      }
    });
  });
});
