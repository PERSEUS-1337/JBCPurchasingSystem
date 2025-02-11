import Supplier from "../../src/models/supplierModel";
import {
  supplierSchema,
  SupplierInput,
} from "../../src/validators/supplierValidator";
import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import {
  validSupplierComplete,
  validSupplierWithDocs,
  invalidSupplierEmails,
  invalidSupplierContactPersonPhoneNumber,
  invalidSupplierMissingContactPersonFields,
  validSupplierMinimum,
  missingRequiredFieldsSupplier,
  invalidSupplierSupplies,
  invalidSupplierStatus,
} from "../setup/mockSuppliers";
import { fromZodError } from "zod-validation-error";

describe("Supplier Validator", () => {
  // ========= SUCCESS CASES =========
  describe("Success Cases: Supplier Validation", () => {
    it("Should pass with a complete valid supplier", () => {
      const result = supplierSchema.safeParse(validSupplierComplete);
      expect(result.success).toBe(true);
      if (result.success) {
        const resultData = result.data;
        expect(resultData.supplierID).toBe(validSupplierComplete.supplierID);
        expect(resultData.name).toBe(validSupplierComplete.name);
        expect(resultData.primaryTag).toBe(validSupplierComplete.primaryTag);
        expect(resultData.address).toBe(validSupplierComplete.address);
        expect(resultData.contactNumbers).toEqual(
          validSupplierComplete.contactNumbers
        );
        expect(resultData.contactPersons).toEqual(
          validSupplierComplete.contactPersons
        );
        expect(resultData.emails).toEqual(validSupplierComplete.emails);
        expect(resultData.tags).toEqual(validSupplierComplete.tags);
        expect(resultData.supplies).toEqual(validSupplierComplete.supplies);
        expect(resultData.documentation).toEqual(
          validSupplierComplete.documentation
        );
        expect(resultData.status).toEqual(validSupplierComplete.status);
      }
    });

    // it("Should pass with a valid supplier that has documentation", () => {
    //   const result = supplierSchema.safeParse(validSupplierWithDocs);
    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.documentation).toEqual(
    //       validSupplierWithDocs.documentation
    //     );
    //   }
    // });

    it("Should pass with minimal required fields and default others", () => {
      const result = supplierSchema.safeParse(validSupplierMinimum);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.supplierID).toBe(validSupplierMinimum.supplierID);
        expect(resultData.name).toBe(validSupplierMinimum.name);
        expect(resultData.contactNumbers).toEqual(
          validSupplierMinimum.contactNumbers
        );
        expect(resultData.primaryTag).toEqual(validSupplierMinimum.primaryTag);
        expect(resultData.emails).toEqual([]);
        expect(resultData.contactPersons).toEqual([]);
        expect(resultData.supplies).toEqual([]);
        expect(resultData.documentation).toEqual([]);
        expect(resultData.tags).toEqual(validSupplierMinimum.tags);
      }
    });

    // it("Should pass with a supplier that has multiple contact persons", () => {
    //   const result = supplierSchema.safeParse(validSupplierWithContacts);
    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.contactPersons.length).toBe(2);
    //     expect(result.data.contactPersons[0].name).toBe(
    //       validSupplierWithContacts.contactPersons[0].name
    //     );
    //     expect(result.data.contactPersons[1].name).toBe(
    //       validSupplierWithContacts.contactPersons[1].name
    //     );
    //   }
    // });

    // it("Should pass with a supplier that has no documentation (defaults to empty array)", () => {
    //   const supplierWithoutDocs = {
    //     ...validSupplierComplete,
    //     documentation: undefined,
    //   };
    //   const result = supplierSchema.safeParse(supplierWithoutDocs);
    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.documentation).toEqual([]);
    //   }
    // });

    // it("Should pass with a supplier having valid emails and an empty email array", () => {
    //   const supplierWithEmptyEmails = { ...validSupplierComplete, emails: [] };
    //   const result = supplierSchema.safeParse(supplierWithEmptyEmails);
    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.emails).toEqual([]);
    //   }
    // });

    // it("Should pass with a supplier that has a valid last order date", () => {
    //   const result = supplierSchema.safeParse(validSupplier);
    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.lastOrderDate).toBeInstanceOf(Date);
    //     expect(result.data.lastOrderDate).toEqual(validSupplier.lastOrderDate);
    //   }
    // });
  });

  // ========= FAIL CASES =========
  describe("Fail Cases: Supplier Validation Errors", () => {
    it("Should fail if required fields are missing", () => {
      const result = supplierSchema.safeParse(missingRequiredFieldsSupplier);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(`Required at "supplierID"`);
        expect(errorMessage).toContain(`Required at "name"`);
        expect(errorMessage).toContain(`Required at "contactNumbers"`);
        expect(errorMessage).toContain(`Required at "address"`);
        expect(errorMessage).toContain(`Required at "primaryTag"`);
        expect(errorMessage).toContain(`Required at "tags"`);
      }
    });

    it("Should fail if email format is invalid", () => {
      const result = supplierSchema.safeParse(invalidSupplierEmails);
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

    it("Should fail if supplies ObjectID format is invalid", () => {
      const result = supplierSchema.safeParse(invalidSupplierSupplies);
      expect(result.success).toBe(false);
      if (result.error) {
        expect(fromZodError(result.error).message).toBe(
          `Validation error: Input not instance of ObjectId at "supplies[0]"`
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

    it("Should fail if `status` is not in supplierStatusEnums", () => {
      const result = supplierSchema.safeParse(invalidSupplierStatus);
      expect(result.success).toBe(false);
      if (result.error) {
        expect(fromZodError(result.error).message).toBe(
          `Validation error: Invalid enum value. Expected 'Active' | 'Inactive', received 'Invalid' at "status"`
        );
      }
    });
  });
});
