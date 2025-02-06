import mongoose from "mongoose";

export const validSupplier = {
  supplierID: "SUP-001",
  name: "ABC Supplies",
  contactNumbers: ["123456789", "987654321"],
  emails: ["abc@example.com", "support@abc.com"],
  address: "123 Main St",
  contactPersons: [
    {
      name: "John Doe",
      number: "123456789",
      email: "john.doe@abc.com",
      position: "Manager",
    },
  ],
  lastOrderDate: new Date("2024-01-15"),
  supplies: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"), new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74")],
  documentation: ["license.pdf", "certificate.jpg"],
  primaryTag: "Electrical",
  tags: ["Construction", "Maintenance"],
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
      number: "123456789",
      email: "john.doe@abc.com",
      position: "Manager",
    },
    {
      name: "Jane Smith",
      number: "987654321",
      email: "jane.smith@abc.com",
      position: "Procurement Officer",
    },
  ],
};

export const invalidSupplierMissingFields = {
  // Missing required fields: supplierID, contactNumbers, address, primaryTag, and tags
  name: "Faulty Supplier",
  emails: ["missing@example.com"],
  contactPersons: [
    {
      name: "Missing Contact",
      number: "999999999",
      email: "missing@contact.com",
      position: "Supervisor",
    },
  ],
  supplies: [],
  documentation: [],
};

export const validSupplierOptionalFields = {
  supplierID: "SUP-002",
  name: "Minimal Supplier",
  contactNumbers: ["123456789"], 
  emails: [],
  address: "456 Secondary St", 
  primaryTag: "General", 
  tags: ["Miscellaneous"], 
};
