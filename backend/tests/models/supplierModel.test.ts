import Supplier, { ISupplier } from "../../src/models/supplierModel";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { connectDB, disconnectDB, dropDB } from "../setup/globalSetupHelper";
import {
  validSupplier,
  invalidSupplierMissingFields,
  validSupplierWithDocumentation,
} from "../setup/mockSuppliers";

describe("Mongoose Model Validation: Supplier", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Success Cases", () => {
    it("Should save a valid supplier", async () => {
      const supplier = new Supplier(validSupplier);
      const savedSupplier = await supplier.save();

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.supplierID).toBe(validSupplier.supplierID);
      expect(savedSupplier.name).toBe(validSupplier.name);
    });

    it("Should default timestamps (createdAt & updatedAt)", async () => {
      const supplier = new Supplier(validSupplier);
      const savedSupplier = await supplier.save();

      expect(savedSupplier.createdAt).toBeDefined();
      expect(savedSupplier.updatedAt).toBeDefined();
      expect(savedSupplier.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(savedSupplier.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("Should allow optional fields to be empty", async () => {
      const supplier = new Supplier({
        supplierID: "SUP-002",
        name: "Minimal Supplier",
      });

      const savedSupplier = await supplier.save();

      expect(savedSupplier._id).toBeDefined();
      expect(savedSupplier.contactPerson).toBeUndefined();
      expect(savedSupplier.contactNumber).toBeUndefined();
      expect(savedSupplier.email).toBeUndefined();
      expect(savedSupplier.address).toBeUndefined();
      expect(savedSupplier.lastOrderDate).toBeUndefined();
      expect(savedSupplier.supplies.length).toBe(0);
      expect(savedSupplier.documentation.length).toBe(0);
    });

    it("Should store an array of supply references", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        supplies: ["60c72b2f5f1b2c001c8e4d73", "60c72b2f5f1b2c001c8e4d74"], // Sample ObjectId values
      });

      const savedSupplier = await supplier.save();
      expect(savedSupplier.supplies.length).toBe(2);
    });

    it("Should allow an array of document filenames in documentation", async () => {
      const supplier = new Supplier(validSupplierWithDocumentation);

      const savedSupplier = await supplier.save();
      expect(savedSupplier.documentation.length).toBe(2);
      expect(savedSupplier.documentation).toEqual(validSupplierWithDocumentation.documentation);
    //   expect(savedSupplier.documentation).toContain("certificate.jpg");
    });
  });

  describe("Fail Cases", () => {
    it("Should reject if required fields are missing", async () => {
      const supplier = new Supplier(invalidSupplierMissingFields);
      await expect(supplier.save()).rejects.toThrow();
    });

    // it("Should enforce unique supplierID", async () => {
    //   await new Supplier(validSupplier).save(); // First supplier

    //   const duplicateSupplier = new Supplier(validSupplier); // Same supplierID
    //   await expect(duplicateSupplier.save()).rejects.toThrow();
    // });

    // it("Should enforce email format if provided", async () => {
    //   const supplier = new Supplier({
    //     ...validSupplier,
    //     email: "invalid-email",
    //   });

    //   await expect(supplier.save()).rejects.toThrow();
    // });

    it("Should reject invalid ObjectId values in supplies array", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        supplies: ["invalidObjectId"],
      });

      await expect(supplier.save()).rejects.toThrow();
    });

    it("Should not allow non-string values in documentation array", async () => {
      const supplier = new Supplier({
        ...validSupplier,
        documentation: [12345, true, { doc: "invalid" }],
      });

      await expect(supplier.save()).rejects.toThrow();
    });
  });
});
