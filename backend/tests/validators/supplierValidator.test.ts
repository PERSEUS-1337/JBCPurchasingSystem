import Supplier from "../../src/models/supplierModel";
import {
  supplierSchema,
  SupplierInput,
} from "../../src/validators/supplierValidator";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { connectDB, disconnectDB, dropDB } from "../setup/globalSetupHelper";
import {
  validSupplier,
  invalidSupplierMissingFields,
  validSupplierWithDocumentation,
  supplierWithContacts,
  validSupplierOptionalFields,
  invalidSupplierEmail,
  invalidSupplierContactPersonPhoneNumber,
  invalidSupplierMissingContactPersonFields,
} from "../setup/mockSuppliers";
import { fromZodError } from "zod-validation-error";

describe("Supplier Validator", () => {
  // ========= SUCCESS CASES =========
  describe("Success Cases: Supplier Validation", () => {
    it("Should pass with a valid supplier", () => {
      const result = supplierSchema.safeParse(validSupplier);
      expect(result.success).toBe(true);
      // if (result.error) console.log(fromZodError(result.error).message);

      if (result.success) {
        // Now TypeScript knows result.data is defined
        expect(result.data.supplierID).toBe(validSupplier.supplierID);
        expect(result.data.name).toBe(validSupplier.name);
        expect(result.data.contactNumbers).toEqual(
          validSupplier.contactNumbers
        );
        expect(result.data.address).toBe(validSupplier.address);
        expect(result.data.primaryTag).toBe(validSupplier.primaryTag);
        expect(result.data.tags).toEqual(validSupplier.tags);
      }
    });

    it("Should pass with a valid supplier that has documentation", () => {
      const result = supplierSchema.safeParse(validSupplierWithDocumentation);
      expect(result.success).toBe(true);
      // if (result.error) console.log(fromZodError(result.error).message);
      if (result.success) {
        expect(result.data.documentation).toEqual(
          validSupplierWithDocumentation.documentation
        );
      }
    });

    it("Should pass with minimal required fields and default others", () => {
      const result = supplierSchema.safeParse(validSupplierOptionalFields);
      expect(result.success).toBe(true);
      // if (result.error) console.log(fromZodError(result.error).message);
      if (result.success) {
        expect(result.data.supplierID).toBe(
          validSupplierOptionalFields.supplierID
        );
        expect(result.data.contactNumbers).toEqual(
          validSupplierOptionalFields.contactNumbers
        );
        expect(result.data.emails).toEqual([]);
        expect(result.data.contactPersons).toEqual([]);
        expect(result.data.tags).toEqual(validSupplierOptionalFields.tags);
      }
    });
  });

  // ========= FAIL CASES =========
  describe("Fail Cases: Supplier Validation Errors", () => {
    it("Should fail if required fields are missing or invalid", () => {
      const result = supplierSchema.safeParse(invalidSupplierMissingFields);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;

        // Check for multiple error messages related to missing or invalid fields
        expect(errorMessage).toContain(`Required at "supplierID"`);
        expect(errorMessage).toContain(`Required at "tags"`);
        expect(errorMessage).toContain(`Required at "address"`);
        expect(errorMessage).toContain(`Required at "primaryTag"`);
      }
    });

    it("Should fail if email format is invalid", () => {
      const result = supplierSchema.safeParse(invalidSupplierEmail);
      expect(result.success).toBe(false);
      if (result.error) {
        expect(fromZodError(result.error).message).toBe(
          `Validation error: Invalid email format at "emails[0]"`
        );
      }
    });

    it("Should fail if contact person has invalid contact number", () => {
      const result = supplierSchema.safeParse(
        invalidSupplierContactPersonPhoneNumber
      );
      expect(result.success).toBe(false);
      if (result.error) {
        expect(fromZodError(result.error).message).toBe(
          `Validation error: Contact number can only contain numbers and an optional '+' at the start at "contactPersons[0].contactNumber"`
        );
      }
    });

    it("Should fail if `contactPersons` are missing required fields", () => {
      const result = supplierSchema.safeParse(
        invalidSupplierMissingContactPersonFields
      );
      expect(result.success).toBe(false);
      if (result.error) {
        expect(fromZodError(result.error).message).toBe(
          `Validation error: Required at "contactPersons[0].contactNumber"`
        );
      }
    });
  });
});
