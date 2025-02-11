import mongoose from "mongoose";

export const validSupplierMinimum = {
  supplierID: "SUP-001",
  name: "ABC Supplies",
  contactNumbers: ["09123456789"],
  address: "123 Main St",
  primaryTag: "Electrical",
  tags: ["Electrical"],
  status: "Active",
};

export const validSupplierWithMultipleContactNumbers = {
  ...validSupplierMinimum,
  contactNumbers: ["09123456789", "09178510213"],
};

export const validSupplierWithSupplies = {
  ...validSupplierMinimum,
  supplies: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"),
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74"),
  ],
};

export const validSupplierWithDocs = {
  ...validSupplierMinimum,
  documentation: ["license.pdf", "certification.jpg", "permit.docx"],
};

export const validSupplierWithContactPersons = {
  ...validSupplierMinimum,
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

export const validSupplierWithEmails = {
  ...validSupplierMinimum,
  emails: ["abc@example.com", "support@abc.com"],
};

export const validSupplierWithTags = {
  ...validSupplierMinimum,
  tags: ["Construction", "Maintenance"],
};

export const validSupplierComplete = {
  ...validSupplierMinimum,
  contactNumbers: ["09123456789", "09178510213"],
  emails: ["abc@example.com", "support@abc.com"],
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
  supplies: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"),
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74"),
  ],
  documentation: ["license.pdf", "certification.jpg", "permit.docx"],
  tags: ["Construction", "Maintenance"],
};

export const { primaryTag, ...missingPrimaryTagSupplier } =
  validSupplierMinimum;

export const { supplierID, name, ...missingFieldsSupplier } =
  validSupplierMinimum;

export const invalidSupplierEmails = {
  ...validSupplierMinimum,
  emails: ["invalid-format"],
};

export const invalidSupplierMissingContactPersonFields = {
  ...validSupplierMinimum,
  contactPersons: [
    {
      name: "Wrong Phone",
      // Missing contactNumber
    },
  ],
};

export const invalidSupplierContactPersonPhoneNumber = {
  ...validSupplierMinimum,
  contactPersons: [
    {
      name: "Wrong Phone",
      contactNumber: "++0123456789", // Invalid due to double "+"
      email: "missing@contact.com",
      position: "Supervisor",
    },
  ],
};

export const invalidSupplierContactPersonEmail = {
  ...validSupplierMinimum,
  contactPersons: [
    {
      name: "Wrong Phone",
      contactNumber: "0123456789", // Invalid due to double "+"
      email: "invalid-email",
      position: "Supervisor",
    },
  ],
};

export const invalidSupplierSupplies = {
  ...validSupplierMinimum,
  supplies: ["invalid-object-id"],
};

export const invalidSupplierDocumentation = {
  ...validSupplierMinimum,
  documentation: [12345, true, { doc: "invalid" }],
};

// export const missingFieldsSupplier = {
//   // Missing required fields: supplierID, contactNumbers, address, primaryTag, and tags
//   name: "Faulty Supplier",
//   emails: ["missing@example.com"],
//   contactPersons: [
//     {
//       name: "Missing Contact",
//       contactNumber: "999999999",
//       email: "missing@contact.com",
//       position: "Supervisor",
//     },
//   ],
//   supplies: [],
//   documentation: [],
// };
//
// export const invalidSupplierEmail = {
//   supplierID: "SUP-002",
//   name: "Minimal Supplier",
//   contactNumbers: ["0123456789"],
//   emails: ["invalid-format"],
//   address: "456 Secondary St",
//   primaryTag: "General",
//   tags: ["Miscellaneous"],
//   status: "Active",
// };
//
// export const invalidSupplierMissingContactPersonFields = {
//   supplierID: "SUP-002",
//   name: "Minimal Supplier",
//   contactNumbers: ["0123456789"],
//   emails: ["invalid@invalid.com"],
//   contactPersons: [
//     {
//       name: "Wrong Phone",
//       // Missing contactNumber, which is required
//     },
//   ],
//   address: "456 Secondary St",
//   primaryTag: "General",
//   tags: ["Miscellaneous"],
//   status: "Active",
// };

// export const invalidSupplierContactPersonPhoneNumber = {
//   supplierID: "SUP-002",
//   name: "Minimal Supplier",
//   contactNumbers: ["09178187094"],
//   emails: ["invalid@invalid.com"],
//   contactPersons: [
//     {
//       name: "Wrong Phone",
//       contactNumber: "++0123456789", // Invalid due to double "+"
//       email: "missing@contact.com",
//       position: "Supervisor",
//     },
//   ],
//   address: "456 Secondary St",
//   primaryTag: "General",
//   tags: ["Miscellaneous"],
//   status: "Active",
// };

export const validSuppliersList = [
  {
    supplierID: "SUP-001",
    name: "ABC Supplies",
    contactNumbers: ["0123456789", "0987654321"],
    emails: ["abc@example.com", "support@abc.com"],
    address: "123 Main St",
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
    documentation: ["license.pdf", "certificate.jpg"],
    primaryTag: "Electrical",
    tags: ["Construction", "Maintenance"],
    status: "Active",
  },
  {
    supplierID: "SUP-002",
    name: "XYZ Industrial",
    contactNumbers: ["09123456789"],
    emails: ["xyz@industry.com"],
    address: "789 Industrial Rd",
    contactPersons: [
      {
        name: "Alice Johnson",
        contactNumber: "09123456789",
        email: "alice.johnson@xyz.com",
        position: "CEO",
      },
    ],
    documentation: ["business_permit.pdf", "tax_certificate.png"],
    primaryTag: "Machinery",
    tags: ["Manufacturing", "Heavy Equipment"],
    status: "Active",
  },
  {
    supplierID: "SUP-003",
    name: "Global Materials Ltd.",
    contactNumbers: ["09987654321"],
    emails: ["global@materials.com"],
    address: "456 Commerce St",
    contactPersons: [
      {
        name: "Bob Williams",
        contactNumber: "09987654321",
        email: "bob.williams@global.com",
        position: "Head of Procurement",
      },
    ],
    documentation: ["ISO_certification.pdf"],
    primaryTag: "Raw Materials",
    tags: ["Steel", "Cement", "Construction"],
    status: "Active",
  },
];

export const updateSupplierData = {
  // supplierID: "SUP-001",
  name: "ABC Supplies New Name",
  // contactNumbers: ["0123456789", "0987654321"],
  // emails: ["abc@example.com", "support@abc.com"],
  address: "456 Less main St.",
  // contactPersons: [],
  // documentation: ["license.pdf", "certificate.jpg"],
  // primaryTag: "Electrical",
  // tags: ["Construction", "Maintenance"],
  // status: "Active",
};

export const invalidUpdateSupplierEmail = {
  ...updateSupplierData,
  emails: ["invalid-email"],
};
