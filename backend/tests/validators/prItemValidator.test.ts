import {
  prItemSchema,
  prItemUpdateSchema,
} from "../../src/validators/prItemValidator";
import { describe, expect, it } from "@jest/globals";
import {
  validPRItemComplete,
  validPRItemMinimum,
  validPRItemWithoutTotalPrice,
  missingRequiredFieldsPRItem,
  invalidPRItemEmptyStrings,
  invalidPRItemWhitespaceFields,
  invalidPRItemNegativeQuantity,
  invalidPRItemZeroQuantity,
  invalidPRItemNegativeUnitPrice,
  invalidPRItemNegativeTotalPrice,
  invalidPRItemBothNegativeValues,
  validPRItemUpdate,
  emptyPRItemUpdate,
  restrictedPRItemUpdate,
  validPRItemPartialUpdate,
} from "../setup/mockPRItems";
import { fromZodError } from "zod-validation-error";

describe("PR Item Validator", () => {
  describe("Success Cases: PR Item Validation", () => {
    it("Should pass with a complete valid PR Item", () => {
      const result = prItemSchema.safeParse(validPRItemComplete);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.prItemID).toBe(validPRItemComplete.prItemID);
        expect(resultData.prID).toBe(validPRItemComplete.prID);
        expect(resultData.supplyID).toBe(validPRItemComplete.supplyID);
        expect(resultData.supplierID).toBe(validPRItemComplete.supplierID);
        expect(resultData.itemDescription).toBe(
          validPRItemComplete.itemDescription
        );
        expect(resultData.quantity).toBe(validPRItemComplete.quantity);
        expect(resultData.unitOfMeasurement).toBe(
          validPRItemComplete.unitOfMeasurement
        );
        expect(resultData.unitPrice).toBe(validPRItemComplete.unitPrice);
        expect(resultData.totalPrice).toBe(validPRItemComplete.totalPrice);
        expect(resultData.deliveryAddress).toBe(
          validPRItemComplete.deliveryAddress
        );
      }
    });

    it("Should pass with minimal required fields", () => {
      const result = prItemSchema.safeParse(validPRItemMinimum);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.prItemID).toBe(validPRItemMinimum.prItemID);
        expect(resultData.prID).toBe(validPRItemMinimum.prID);
        expect(resultData.supplyID).toBe(validPRItemMinimum.supplyID);
        expect(resultData.supplierID).toBe(validPRItemMinimum.supplierID);
        expect(resultData.itemDescription).toBe(
          validPRItemMinimum.itemDescription
        );
        expect(resultData.quantity).toBe(validPRItemMinimum.quantity);
        expect(resultData.unitOfMeasurement).toBe(
          validPRItemMinimum.unitOfMeasurement
        );
        expect(resultData.unitPrice).toBe(validPRItemMinimum.unitPrice);
        expect(resultData.deliveryAddress).toBe(
          validPRItemMinimum.deliveryAddress
        );
        expect(resultData.totalPrice).toBeUndefined(); // Optional field
      }
    });

    it("Should pass without totalPrice (optional field)", () => {
      const result = prItemSchema.safeParse(validPRItemWithoutTotalPrice);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.prItemID).toBe(validPRItemWithoutTotalPrice.prItemID);
        expect(resultData.totalPrice).toBeUndefined();
      }
    });
  });

  describe("Fail Cases: PR Item Validation Errors", () => {
    it("Should fail if required fields are missing", () => {
      const result = prItemSchema.safeParse(missingRequiredFieldsPRItem);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain('Required at "prID"');
        expect(errorMessage).toContain('Required at "supplyID"');
        expect(errorMessage).toContain('Required at "supplierID"');
        expect(errorMessage).toContain('Required at "itemDescription"');
        expect(errorMessage).toContain('Required at "quantity"');
        expect(errorMessage).toContain('Required at "unitOfMeasurement"');
        expect(errorMessage).toContain('Required at "unitPrice"');
        expect(errorMessage).toContain('Required at "deliveryAddress"');
      }
    });

    it("Should fail if string fields are empty", () => {
      const result = prItemSchema.safeParse(invalidPRItemEmptyStrings);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("PR Item ID is required");
        expect(errorMessage).toContain("PR ID is required");
        expect(errorMessage).toContain("Supply ID is required");
        expect(errorMessage).toContain("Supplier ID is required");
        expect(errorMessage).toContain("Item description is required");
        expect(errorMessage).toContain("Unit of measurement is required");
        expect(errorMessage).toContain("Delivery address is required");
      }
    });

    it("Should fail if string fields contain only whitespace", () => {
      const result = prItemSchema.safeParse(invalidPRItemWhitespaceFields);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("PR Item ID is required");
        expect(errorMessage).toContain("PR ID is required");
        expect(errorMessage).toContain("Supply ID is required");
        expect(errorMessage).toContain("Supplier ID is required");
        expect(errorMessage).toContain("Item description is required");
        expect(errorMessage).toContain("Unit of measurement is required");
        expect(errorMessage).toContain("Delivery address is required");
      }
    });

    it("Should fail if quantity is negative", () => {
      const result = prItemSchema.safeParse(invalidPRItemNegativeQuantity);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Quantity must be at least 1");
      }
    });

    it("Should fail if quantity is zero", () => {
      const result = prItemSchema.safeParse(invalidPRItemZeroQuantity);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Quantity must be at least 1");
      }
    });

    it("Should fail if unit price is negative", () => {
      const result = prItemSchema.safeParse(invalidPRItemNegativeUnitPrice);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Unit price must be non-negative");
      }
    });

    it("Should fail if total price is negative", () => {
      const result = prItemSchema.safeParse(invalidPRItemNegativeTotalPrice);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Total price must be non-negative");
      }
    });

    it("Should fail if both quantity and unit price are negative", () => {
      const result = prItemSchema.safeParse(invalidPRItemBothNegativeValues);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Quantity must be at least 1");
        expect(errorMessage).toContain("Unit price must be non-negative");
      }
    });
  });

  describe("Success Cases: PR Item Update Validation", () => {
    it("Should pass with valid update data", () => {
      const result = prItemUpdateSchema.safeParse(validPRItemUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.itemDescription).toBe(
          validPRItemUpdate.itemDescription
        );
        expect(resultData.quantity).toBe(validPRItemUpdate.quantity);
        expect(resultData.unitPrice).toBe(validPRItemUpdate.unitPrice);
        expect(resultData.deliveryAddress).toBe(
          validPRItemUpdate.deliveryAddress
        );
      }
    });

    it("Should pass with partial update data", () => {
      const result = prItemUpdateSchema.safeParse(validPRItemPartialUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.quantity).toBe(validPRItemPartialUpdate.quantity);
        expect(resultData.unitPrice).toBe(validPRItemPartialUpdate.unitPrice);
      }
    });
  });

  describe("Fail Cases: PR Item Update Validation Errors", () => {
    it("Should fail if update object is empty", () => {
      const result = prItemUpdateSchema.safeParse(emptyPRItemUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("At least one field must be updated");
      }
    });

    it("Should fail if restricted fields are being updated", () => {
      const result = prItemUpdateSchema.safeParse(restrictedPRItemUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: prItemID"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: prID"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: createdAt"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: updatedAt"
        );
      }
    });
  });
});
