import Supplier from "../../src/models/supplierModel";
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
  saveSupplierAndReturn,
} from "../setup/globalSetupHelper";
import {
  validSupplierMinimum,
  missingFieldsSupplier,
  validSupplierWithDocs,
  validSupplierWithContactPersons,
  validSupplierComplete,
  validSupplierWithSupplies,
  validSupplierWithMultipleContactNumbers,
  validSupplierWithEmails,
  invalidSupplierEmails,
  invalidSupplierMissingContactPersonFields,
  invalidSupplierContactPersonEmail,
  invalidSupplierSupplies,
  invalidSupplierDocumentation,
  missingPrimaryTagSupplier,
} from "../setup/mockSuppliers";

describe("Supplier Model Validation", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases: Supplier Creation and Validation", () => {
    it("Should save a valid complete supplier", async () => {
      const savedSupplier = await saveSupplierAndReturn(validSupplierComplete);

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(validSupplierComplete.supplierID);
      expect(savedSupplier.name).toBe(validSupplierComplete.name);
      expect(savedSupplier.contactNumbers).toEqual(
        validSupplierComplete.contactNumbers
      );
      expect(savedSupplier.address).toBe(validSupplierComplete.address);
      expect(savedSupplier.primaryTag).toBe(validSupplierComplete.primaryTag);
      expect(savedSupplier.status).toBe(validSupplierComplete.status);
      expect(savedSupplier.emails).toEqual(validSupplierComplete.emails);
      expect(savedSupplier.contactPersons).toEqual(
        validSupplierComplete.contactPersons
      );
      expect(savedSupplier.supplies).toEqual(validSupplierComplete.supplies);
      expect(savedSupplier.documentation).toEqual(
        validSupplierComplete.documentation
      );
      expect(savedSupplier.tags).toEqual(validSupplierComplete.tags);

      // Should have default timestamps
      expect(savedSupplier.createdAt).toBeDefined();
      expect(savedSupplier.updatedAt).toBeDefined();
    });

    it("Should allow minimal required fields and default others", async () => {
      const savedSupplier = await saveSupplierAndReturn(validSupplierMinimum);

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(validSupplierMinimum.supplierID);
      expect(savedSupplier.name).toBe(validSupplierMinimum.name);
      expect(savedSupplier.contactNumbers).toEqual(
        validSupplierMinimum.contactNumbers
      );
      expect(savedSupplier.primaryTag).toBe(validSupplierMinimum.primaryTag);
      expect(savedSupplier.emails).toEqual([]);
      expect(savedSupplier.contactPersons).toEqual([]);
      expect(savedSupplier.supplies).toEqual([]);
      expect(savedSupplier.documentation).toEqual([]);
      expect(savedSupplier.tags).toEqual(validSupplierMinimum.tags);
    });

    // it("Should store an array of supply references", async () => {
    //   const savedSupplier = await saveSupplierAndReturn(validSupplierWithSupplies);
    //   expect(savedSupplier.supplies).toEqual(
    //     validSupplierWithSupplies.supplies
    //   );
    // });

    // it("Should allow an array of document filenames in documentation", async () => {
    //   const savedSupplier = await saveSupplierAndReturn(validSupplierWithDocs);

    //   expect(savedSupplier.documentation).toEqual(
    //     validSupplierWithDocs.documentation
    //   );
    // });

    // it("Should save multiple contact numbers", async () => {
    //   const savedSupplier = await saveSupplierAndReturn(
    //     validSupplierWithMultipleContactNumbers
    //   );
    //   expect(savedSupplier.contactNumbers).toEqual(
    //     validSupplierWithMultipleContactNumbers.contactNumbers
    //   );
    // });

    // it("Should save multiple emails", async () => {
    //   const savedSupplier = await saveSupplierAndReturn(
    //     validSupplierWithEmails
    //   );

    //   expect(savedSupplier.emails).toEqual(validSupplierWithEmails.emails);
    // });

    // it("Should save contact persons with name, number, email, and position", async () => {
    //   const savedSupplier = await saveSupplierAndReturn(
    //     validSupplierWithContactPersons
    //   );

    //   expect(savedSupplier.contactPersons).toEqual(
    //     validSupplierWithContactPersons.contactPersons
    //   );
    // });
  });

  // ========= FAIL CASES =========
    describe("Fail Cases: Supplier Validation and Error Handling", () => {
      it("Should reject if required fields are missing", async () => {
        const supplier = new Supplier(missingFieldsSupplier);
        await expect(supplier.save()).rejects.toThrow();
      });

      // TODO: Fix unique supplierID issue in Mongoose Model Schema Level
      // it("Should enforce unique supplierID", async () => {
      //   const supplier = new Supplier(validSupplier);
      //   const savedSupplier = await supplier.save();
      //   const duplicateSupplier = new Supplier(validSupplier);
      //   // const savedDuplicateSupplier = await duplicateSupplier.save();
      //   // console.log(savedSupplier, savedDuplicateSupplier);
      //   await expect(duplicateSupplier.save()).rejects.toThrow();
      // });

      it("Should enforce valid email format in `emails` field", async () => {
        const supplier = new Supplier(invalidSupplierEmails);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should enforce valid email format in `contactPersons` field", async () => {
        const supplier = new Supplier(invalidSupplierContactPersonEmail);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should reject invalid ObjectId values in supplies array", async () => {
        const supplier = new Supplier(invalidSupplierSupplies);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should reject non-string values in documentation array", async () => {
        const supplier = new Supplier(invalidSupplierDocumentation);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should reject `contactPersons` missing required fields", async () => {
        const supplier = new Supplier(invalidSupplierMissingContactPersonFields);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should reject supplier without `primaryTag`", async () => {
        const supplier = new Supplier(missingPrimaryTagSupplier);

        await expect(supplier.save()).rejects.toThrow();
      });

      it("Should reject supplier with empty `tags` array", async () => {
        const supplier = new Supplier({
          ...validSupplierMinimum,
          tags: [],
        });

        await expect(supplier.save()).rejects.toThrow();
      });
    });
});
