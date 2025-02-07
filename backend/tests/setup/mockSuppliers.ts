import mongoose from "mongoose";

export const validSupplier = {
  supplierID: "SUP-001",
  name: "ABC Supplies",
  contactNumbers: ["0123456789", "0987654321"],
  emails: ["abc@example.com", "support@abc.com"],
  address: "123 Main St",
  contactPersons: [],
  lastOrderDate: new Date("2024-01-15"),
  supplies: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"),
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74"),
  ],
  documentation: ["license.pdf", "certificate.jpg"],
  primaryTag: "Electrical",
  tags: ["Construction", "Maintenance"],
  status: "Active",
};

export const validSupplierWithDocumentation = {
  ...validSupplier,
  documentation: ["license.pdf", "certification.jpg", "permit.docx"],
};

export const supplierWithContacts = {
  ...validSupplier,
  contactPersons: [
    {
      name: "John Doe",
      contactNumber: "0123456789",
      email: "john.doe@abc.com",
      position: "Manager",
    },
    {
      name: "Jane Smith",
      contactNumber: "0987654321",
      email: "jane.smith@abc.com",
      position: "Procurement Officer",
    },
  ],
};

export const validSupplierOptionalFields = {
  supplierID: "SUP-002",
  name: "Minimal Supplier",
  contactNumbers: ["0123456789"],
  emails: [],
  address: "456 Secondary St",
  primaryTag: "General",
  tags: ["Miscellaneous"],
  status: "Active",
};

export const invalidSupplierMissingFields = {
  // Missing required fields: supplierID, contactNumbers, address, primaryTag, and tags
  name: "Faulty Supplier",
  emails: ["missing@example.com"],
  contactPersons: [
    {
      name: "Missing Contact",
      contactNumber: "999999999",
      email: "missing@contact.com",
      position: "Supervisor",
    },
  ],
  supplies: [],
  documentation: [],
};

export const invalidSupplierEmail = {
  supplierID: "SUP-002",
  name: "Minimal Supplier",
  contactNumbers: ["0123456789"],
  emails: ["invalid-format"],
  address: "456 Secondary St",
  primaryTag: "General",
  tags: ["Miscellaneous"],
  status: "Active",
};

export const invalidSupplierMissingContactPersonFields = {
  supplierID: "SUP-002",
  name: "Minimal Supplier",
  contactNumbers: ["0123456789"],
  emails: ["invalid@invalid.com"],
  contactPersons: [
    {
      name: "Wrong Phone",
      // Missing contactNumber, which is required
    },
  ],
  address: "456 Secondary St",
  primaryTag: "General",
  tags: ["Miscellaneous"],
  status: "Active",
};

export const invalidSupplierContactPersonPhoneNumber = {
  supplierID: "SUP-002",
  name: "Minimal Supplier",
  contactNumbers: ["09178187094"],
  emails: ["invalid@invalid.com"],
  contactPersons: [
    {
      name: "Wrong Phone",
      contactNumber: "++0123456789", // Invalid due to double "+"
      email: "missing@contact.com",
      position: "Supervisor",
    },
  ],
  address: "456 Secondary St",
  primaryTag: "General",
  tags: ["Miscellaneous"],
  status: "Active",
};
