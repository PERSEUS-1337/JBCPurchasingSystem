import Supplier from "../../src/models/supplierModel";
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
  missingFieldsSupplier,
  validSupplierWithDocs,
  validSupplierWithContacts,
  validSupplierOptional,
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

  // ========= SUCCESS CASES =========
  describe("Success Cases: Supplier Creation and Validation", () => {
    it("Should save a valid supplier", async () => {
      const supplier = new Supplier(validSupplier);
      const savedSupplier = await supplier.save();

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(validSupplier.supplierID);
      expect(savedSupplier.name).toBe(validSupplier.name);
      expect(savedSupplier.contactNumbers).toEqual(
        validSupplier.contactNumbers
      );
      expect(savedSupplier.emails).toEqual(validSupplier.emails);
      expect(savedSupplier.address).toBe(validSupplier.address);
      expect(savedSupplier.primaryTag).toBe(validSupplier.primaryTag);
      expect(savedSupplier.tags).toEqual(validSupplier.tags);
    });

    it("Should default timestamps (createdAt & updatedAt)", async () => {
      const supplier = new Supplier(validSupplier);
      const savedSupplier = await supplier.save();

      expect(savedSupplier.createdAt).toBeDefined();
      expect(savedSupplier.updatedAt).toBeDefined();
      expect(savedSupplier.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(savedSupplier.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("Should allow minimal required fields and default others", async () => {
      const supplier = new Supplier(validSupplierOptional);
      const savedSupplier = await supplier.save();

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(validSupplierOptional.supplierID);
      expect(savedSupplier.name).toBe(validSupplierOptional.name);
      expect(savedSupplier.contactNumbers).toEqual(
        validSupplierOptional.contactNumbers
      );
      expect(savedSupplier.emails).toEqual([]);
      expect(savedSupplier.contactPersons).toEqual([]);
      expect(savedSupplier.supplies.length).toBe(0);
      expect(savedSupplier.documentation.length).toBe(0);
      expect(savedSupplier.primaryTag).toBe(validSupplierOptional.primaryTag);
      expect(savedSupplier.tags).toEqual(validSupplierOptional.tags);
    });

    it("Should store an array of supply references", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        supplies: ["60c72b2f5f1b2c001c8e4d73", "60c72b2f5f1b2c001c8e4d74"], // Sample ObjectId values
      });

      const savedSupplier = await supplier.save();
      expect(savedSupplier.supplies.length).toBe(2);
      expect(savedSupplier.supplies).toEqual(validSupplier.supplies);
    });

    it("Should allow an array of document filenames in documentation", async () => {
      const supplier = new Supplier(validSupplierWithDocs);
      const savedSupplier = await supplier.save();

      expect(savedSupplier.documentation.length).toBe(3);
      expect(savedSupplier.documentation).toEqual(
        validSupplierWithDocs.documentation
      );
    });

    it("Should save multiple contact numbers", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        contactNumbers: ["1234567890", "0987654321"],
      });

      const savedSupplier = await supplier.save();
      expect(savedSupplier.contactNumbers.length).toBe(2);
      expect(savedSupplier.contactNumbers).toContain("1234567890");
      expect(savedSupplier.contactNumbers).toContain("0987654321");
    });

    it("Should save multiple emails", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        emails: ["sales@company.com", "info@company.com"],
      });

      const savedSupplier = await supplier.save();
      expect(savedSupplier.emails.length).toBe(2);
      expect(savedSupplier.emails).toContain("sales@company.com");
      expect(savedSupplier.emails).toContain("info@company.com");
    });

    it("Should save contact persons with name, number, email, and position", async () => {
      const supplier = new Supplier(validSupplierWithContacts);
      const savedSupplier = await supplier.save();

      expect(savedSupplier.contactPersons.length).toBe(2);
      expect(savedSupplier.contactPersons[0]).toMatchObject(
        validSupplierWithContacts.contactPersons[0]
      );
      expect(savedSupplier.contactPersons[1]).toMatchObject(
        validSupplierWithContacts.contactPersons[1]
      );
    });

    // it("Should allow setting lastOrderDate", async () => {
    //   const supplier = new Supplier({
    //     ...validSupplier,
    //     lastOrderDate: new Date("2024-02-01"),
    //   });

    //   const savedSupplier = await supplier.save();
    //   expect(savedSupplier.lastOrderDate).toBeDefined();
    //   expect(savedSupplier.lastOrderDate.toISOString()).toBe(
    //     new Date("2024-02-01").toISOString()
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
      const supplier = new Supplier({
        ...validSupplier,
        emails: ["invalid-email"],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should enforce valid email format in `contactPersons` field", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        contactPersons: [
          {
            name: "Invalid Email Contact",
            number: "1234567890",
            email: "not-an-email",
            position: "Supervisor",
          },
        ],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should reject invalid ObjectId values in supplies array", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        supplies: ["invalidObjectId"],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should reject non-string values in documentation array", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        documentation: [12345, true, { doc: "invalid" }],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should reject `contactPersons` missing required fields", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        contactPersons: [
          { name: "Missing Number", email: "missing@company.com" },
        ],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should reject supplier without `primaryTag`", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        primaryTag: undefined,
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should reject supplier with empty `tags` array", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        tags: [],
      });

      await expect(supplier.save()).rejects.toThrow();
    });
  });
});
