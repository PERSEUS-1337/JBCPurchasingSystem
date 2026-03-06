import { prSchema, prUpdateSchema } from "../../src/validators/prValidator";
import { describe, expect, it } from "@jest/globals";
import {
  validPRComplete,
  validPRMinimum,
  validPRWithStringDates,
  missingRequiredFieldsPR,
  invalidPRStatus,
  invalidPRDate,
  invalidPRNegativeCost,
  invalidPREmptyStrings,
  invalidPRWhitespaceFields,
  invalidPRInvalidObjectIds,
  validPRUpdate,
  emptyPRUpdate,
  restrictedPRUpdate,
} from "../setup/mockPRs";
import { fromZodError } from "zod-validation-error";

describe("PR Validator", () => {
  describe("Success Cases: PR Validation", () => {
    it("Should pass with a complete valid PR", () => {
      const result = prSchema.safeParse(validPRComplete);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.prID).toBe(validPRComplete.prID);
        expect(resultData.projCode).toBe(validPRComplete.projCode);
        expect(resultData.projName).toBe(validPRComplete.projName);
        expect(resultData.projClient).toBe(validPRComplete.projClient);
        expect(resultData.dateRequested).toBeInstanceOf(Date);
        expect(resultData.dateRequired).toBeInstanceOf(Date);
        expect(resultData.requestedBy).toBe(validPRComplete.requestedBy);
        expect(resultData.recommendedBy).toBe(validPRComplete.recommendedBy);
        expect(resultData.approvedBy).toBe(validPRComplete.approvedBy);
        expect(resultData.prStatus).toBe(validPRComplete.prStatus);
        expect(resultData.itemsRequested).toEqual(
          validPRComplete.itemsRequested
        );
        expect(resultData.totalCost).toBe(validPRComplete.totalCost);
        expect(resultData.justification).toBe(validPRComplete.justification);
      }
    });

    it("Should pass with minimal required fields", () => {
      const result = prSchema.safeParse(validPRMinimum);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.prID).toBe(validPRMinimum.prID);
        expect(resultData.projCode).toBe(validPRMinimum.projCode);
        expect(resultData.projName).toBe(validPRMinimum.projName);
        expect(resultData.projClient).toBe(validPRMinimum.projClient);
        expect(resultData.dateRequested).toBeInstanceOf(Date);
        expect(resultData.dateRequired).toBeInstanceOf(Date);
        expect(resultData.requestedBy).toBe(validPRMinimum.requestedBy);
        expect(resultData.approvedBy).toBe(validPRMinimum.approvedBy);
        expect(resultData.prStatus).toBe(validPRMinimum.prStatus);
        expect(resultData.totalCost).toBe(validPRMinimum.totalCost);
      }
    });

    it("Should pass and transform string dates to Date objects", () => {
      const result = prSchema.safeParse(validPRWithStringDates);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.dateRequested).toBeInstanceOf(Date);
        expect(resultData.dateRequired).toBeInstanceOf(Date);
        expect(resultData.dateRequested.toISOString()).toBe(
          new Date("2024-01-20").toISOString()
        );
        expect(resultData.dateRequired.toISOString()).toBe(
          new Date("2024-02-20").toISOString()
        );
      }
    });
  });

  describe("Fail Cases: PR Validation Errors", () => {
    it("Should fail if required fields are missing", () => {
      const result = prSchema.safeParse(missingRequiredFieldsPR);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain('Required at "prID"');
        expect(errorMessage).toContain('Required at "projCode"');
        expect(errorMessage).toContain('Required at "projName"');
        expect(errorMessage).toContain('Required at "projClient"');
        expect(errorMessage).toContain('Required at "dateRequired"');
        expect(errorMessage).toContain('Required at "requestedBy"');
        expect(errorMessage).toContain('Required at "approvedBy"');
        expect(errorMessage).toContain('Required at "prStatus"');
        expect(errorMessage).toContain('Required at "totalCost"');
      }
    });

    it("Should fail if PR status is not in enum values", () => {
      const result = prSchema.safeParse(invalidPRStatus);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Invalid enum value");
        expect(errorMessage).toContain(
          "'Draft' | 'Recommended' | 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled'"
        );
        expect(errorMessage).toContain("received 'InvalidStatus'");
      }
    });

    it("Should fail if date format is invalid", () => {
      const result = prSchema.safeParse(invalidPRDate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Invalid date");
      }
    });

    it("Should fail if total cost is negative", () => {
      const result = prSchema.safeParse(invalidPRNegativeCost);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Total cost must be non-negative");
      }
    });

    it("Should fail if string fields are empty", () => {
      const result = prSchema.safeParse(invalidPREmptyStrings);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("PR ID is required");
        expect(errorMessage).toContain("Project code is required");
        expect(errorMessage).toContain("Project name is required");
        expect(errorMessage).toContain("Project client is required");
        expect(errorMessage).toContain("Requested by is required");
        expect(errorMessage).toContain("Approved by is required");
      }
    });

    it("Should fail if string fields contain only whitespace", () => {
      const result = prSchema.safeParse(invalidPRWhitespaceFields);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("PR ID is required");
        expect(errorMessage).toContain("Project code is required");
        expect(errorMessage).toContain("Project name is required");
        expect(errorMessage).toContain("Project client is required");
        expect(errorMessage).toContain("Requested by is required");
        expect(errorMessage).toContain("Approved by is required");
      }
    });

    it("Should fail if itemsRequested contains invalid ObjectIds", () => {
      const result = prSchema.safeParse(invalidPRInvalidObjectIds);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("Invalid ObjectId format");
      }
    });
  });

  describe("Success Cases: PR Update Validation", () => {
    it("Should pass with valid update data", () => {
      const result = prUpdateSchema.safeParse(validPRUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.projName).toBe(validPRUpdate.projName);
        expect(resultData.projClient).toBe(validPRUpdate.projClient);
        expect(resultData.totalCost).toBe(validPRUpdate.totalCost);
        expect(resultData.justification).toBe(validPRUpdate.justification);
      }
    });

    it("Should pass with partial update data", () => {
      const partialUpdate = { projName: "Updated Name" };
      const result = prUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        const resultData = result.data;
        expect(resultData.projName).toBe(partialUpdate.projName);
      }
    });
  });

  describe("Fail Cases: PR Update Validation Errors", () => {
    it("Should fail if update object is empty", () => {
      const result = prUpdateSchema.safeParse(emptyPRUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain("At least one field must be updated");
      }
    });

    it("Should fail if restricted fields are being updated", () => {
      const result = prUpdateSchema.safeParse(restrictedPRUpdate);
      expect(result.success).toBe(false);

      if (result.error) {
        const errorMessage = fromZodError(result.error).message;
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: prID"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: createdAt"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: updatedAt"
        );
        expect(errorMessage).toContain(
          "Update not allowed on restricted field: itemsRequested"
        );
      }
    });
  });
});
