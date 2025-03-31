import mongoose from "mongoose";

// Define supplier IDs that are referenced in mockSupplies.ts
export const SUPPLIER_IDS = {
  SUPPLIER_1: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
  SUPPLIER_2: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
  SUPPLIER_3: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d77"),
  SUPPLIER_4: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d78"),
  SUPPLIER_5: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d79"),
  SUPPLIER_6: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d80"),
  SUPPLIER_7: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d81"),
  SUPPLIER_8: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d82"),
};

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

// export const validSupplierWithSupplies = {
//   ...validSupplierMinimum,
//   supplies: [
//     new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"),
//     new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74"),
//   ],
// };

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
  // supplies: [
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d73"),
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d74"),
  // ],
  documentation: ["license.pdf", "certification.jpg", "permit.docx"],
  tags: ["Construction", "Maintenance"],
};

export const {
  supplierID,
  name,
  contactNumbers,
  address,
  primaryTag,
  tags,
  ...missingRequiredFieldsSupplier
} = validSupplierComplete;

export const invalidSupplierEmails = {
  ...validSupplierMinimum,
  emails: ["invalid-format"],
};

export const invalidSupplierContactNumbers = {
  ...validSupplierMinimum,
  contactNumbers: ["invalid-phone", "wrong-phone", "12345"],
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

// export const invalidSupplierSupplies = {
//   ...validSupplierMinimum,
//   supplies: ["invalid-object-id"],
// };

export const invalidSupplierDocumentation = {
  ...validSupplierMinimum,
  documentation: [12345, true, { doc: "invalid" }],
};

export const invalidSupplierStatus = {
  ...validSupplierMinimum,
  status: "Invalid",
};

export const validSuppliersList = [
  {
    _id: SUPPLIER_IDS.SUPPLIER_1,
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
    _id: SUPPLIER_IDS.SUPPLIER_2,
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
    _id: SUPPLIER_IDS.SUPPLIER_3,
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
  {
    _id: SUPPLIER_IDS.SUPPLIER_4,
    supplierID: "SUP-004",
    name: "Fastener Solutions",
    contactNumbers: ["09123456789"],
    emails: ["fastener@example.com"],
    address: "789 Fastener St",
    contactPersons: [
      {
        name: "Charlie Brown",
        contactNumber: "09123456789",
        email: "charlie@fastener.com",
        position: "Sales Manager",
      },
    ],
    documentation: ["business_permit.pdf"],
    primaryTag: "Fasteners",
    tags: ["Hardware", "Construction"],
    status: "Active",
  },
  {
    _id: SUPPLIER_IDS.SUPPLIER_5,
    supplierID: "SUP-005",
    name: "Plumbing Pro",
    contactNumbers: ["09123456789"],
    emails: ["plumbing@pro.com"],
    address: "123 Pipe St",
    contactPersons: [
      {
        name: "David Wilson",
        contactNumber: "09123456789",
        email: "david@plumbing.com",
        position: "Manager",
      },
    ],
    documentation: ["license.pdf"],
    primaryTag: "Plumbing",
    tags: ["Pipes", "Fittings"],
    status: "Active",
  },
  {
    _id: SUPPLIER_IDS.SUPPLIER_6,
    supplierID: "SUP-006",
    name: "Pipe Solutions",
    contactNumbers: ["09123456789"],
    emails: ["pipe@solution.com"],
    address: "456 Pipe Rd",
    contactPersons: [
      {
        name: "Eve Smith",
        contactNumber: "09123456789",
        email: "eve@pipe.com",
        position: "Sales Director",
      },
    ],
    documentation: ["permit.pdf"],
    primaryTag: "Plumbing",
    tags: ["PVC", "Pipes"],
    status: "Active",
  },
  {
    _id: SUPPLIER_IDS.SUPPLIER_7,
    supplierID: "SUP-007",
    name: "Screw Masters",
    contactNumbers: ["09123456789"],
    emails: ["screw@masters.com"],
    address: "789 Screw Ave",
    contactPersons: [
      {
        name: "Frank Johnson",
        contactNumber: "09123456789",
        email: "frank@screw.com",
        position: "Owner",
      },
    ],
    documentation: ["license.pdf"],
    primaryTag: "Hardware",
    tags: ["Screws", "Fasteners"],
    status: "Active",
  },
  {
    _id: SUPPLIER_IDS.SUPPLIER_8,
    supplierID: "SUP-008",
    name: "Hardware Hub",
    contactNumbers: ["09123456789"],
    emails: ["hardware@hub.com"],
    address: "123 Hardware St",
    contactPersons: [
      {
        name: "Grace Lee",
        contactNumber: "09123456789",
        email: "grace@hardware.com",
        position: "Manager",
      },
    ],
    documentation: ["permit.pdf"],
    primaryTag: "Hardware",
    tags: ["Tools", "Fasteners"],
    status: "Active",
  },
];

export const validSupplierUpdateMinimumData = {
  name: "ABC Supplies New Name",
  address: "456 Less main St.",
  primaryTag: "Mechanical",
  status: "Inactive",
};
export const validSupplierUpdatePartialData = {
  primaryTag: "Mechanical",
  status: "Inactive",
};
export const validSupplierUpdateCompleteData = {
  ...validSupplierUpdateMinimumData,
  contactNumbers: ["091234567890", "09773515590"],
  emails: ["cde@example.com", "help@abc.com"],
  contactPersons: [
    {
      name: "John Wick",
      contactNumber: "0123456789",
      email: "john.doe@abc.com",
      position: "Manager",
    },
    {
      name: "Jane Doe",
      contactNumber: "0987654321",
      email: "jane.smith@abc.com",
      position: "Procurement Officer",
    },
  ],
  // supplies: [
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
  // ],
  documentation: ["lisensya.pdf", "certipikado.jpg", "permit.docs"],
  tags: ["Mechanical", "Repair"],
};

export const invalidUpdateSupplierEmail = {
  ...validSupplierUpdateMinimumData,
  emails: ["invalid-email"],
};

export const restrictedUpdateSupplierData = {
  supplierID: "SUP-999",
  // supplies: [
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
  //   new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
  // ]
};
