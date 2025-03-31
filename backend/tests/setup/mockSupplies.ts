import mongoose from "mongoose";

// ========= VALID SUPPLIES =========

// Minimal valid supply data
export const validSupplyMinimum = {
  supplyID: "SPL-1002",
  name: "Steel Bolt M10",
  description: "Steel Bolt M10 standard size",
  categories: ["Fasteners"],
  unitMeasure: "pc",
  suppliers: [new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75")],
  supplierPricing: [
    {
      supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
      price: 50.0,
    },
  ],
  specifications: [],
  attachments: [],
};

// A complete supply record built from the minimum and additional fields
export const validSupplyComplete = {
  ...validSupplyMinimum,
  supplyID: "SPL-1001",
  name: 'G.I. U-Bolt 8" x 3/8dia',
  description: 'G.I. U-Bolt 8" x 3/8dia with double washer and nut',
  categories: ["Hardware", "Fasteners"],
  suppliers: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
  ],
  supplierPricing: [
    {
      supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
      price: 50.0,
    },
    {
      supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
      price: 69.0,
    },
  ],
  specifications: [
    { specProperty: "Diameter", specValue: '3/8"' },
    { specProperty: "Material", specValue: "Galvanized Iron" },
  ],
  status: "Active",
  attachments: ["brochure.pdf"],
};

// A list of valid supplies using the minimum as a baseline
export const validSuppliesList = [
  {
    ...validSupplyMinimum,
    supplyID: "SPL-1002",
    name: 'Stainless Steel Hex Bolt 1/2" x 2"',
    description: 'Stainless Steel Hex Bolt 1/2" x 2" with nut',
    categories: ["Hardware", "Fasteners"],
    unitMeasure: "pc",
    suppliers: [
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d77"),
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d78"),
    ],
    supplierPricing: [
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d77"),
        price: 12.5,
      },
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d78"),
        price: 15.0,
      },
    ],
    specifications: [
      { specProperty: "Diameter", specValue: '1/2"' },
      { specProperty: "Material", specValue: "Stainless Steel" },
    ],
    status: "Active",
    attachments: ["specsheet.pdf"],
  },
  {
    ...validSupplyMinimum,
    supplyID: "SPL-1003",
    name: 'PVC Pipe 4" x 10ft',
    description: 'PVC Pipe 4" diameter, 10 feet long',
    categories: ["Plumbing", "Pipes"],
    unitMeasure: "pc",
    suppliers: [
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d79"),
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d80"),
    ],
    supplierPricing: [
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d79"),
        price: 25.0,
      },
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d80"),
        price: 28.0,
      },
    ],
    specifications: [
      { specProperty: "Diameter", specValue: '4"' },
      { specProperty: "Length", specValue: "10ft" },
      { specProperty: "Material", specValue: "PVC" },
    ],
    status: "Active",
    attachments: ["catalog.pdf"],
  },
  {
    ...validSupplyMinimum,
    supplyID: "SPL-1004",
    name: 'Wood Screw #8 x 1-1/2"',
    description: 'Wood Screw #8 x 1-1/2", Phillips head',
    categories: ["Hardware", "Fasteners"],
    unitMeasure: "pc",
    suppliers: [
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d81"),
      new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d82"),
    ],
    supplierPricing: [
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d81"),
        price: 0.5,
      },
      {
        supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d82"),
        price: 0.6,
      },
    ],
    specifications: [
      { specProperty: "Size", specValue: '#8 x 1-1/2"' },
      { specProperty: "Material", specValue: "Steel" },
    ],
    status: "Active",
    attachments: ["manual.pdf"],
  },
];

// ========= INVALID SUPPLIES =========

// missingRequiredFieldsSupply: Remove key required fields from the complete supply.
// Here we use object destructuring to remove supplyID, name, description, categories,
// unitMeasure, suppliers, and supplierPricing, which we assume are required.
export const {
  supplyID,
  name,
  description,
  categories,
  unitMeasure,
  suppliers,
  supplierPricing,
  ...missingRequiredFieldsSupply
} = validSupplyComplete;

export const invalidSupplyComplete = {
  supplyID: "BAD-1001",
  name: "",
  description: "",
  categories: [],
  unitMeasure: "",
  suppliers: [],
  supplierPricing: [
    {
      supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
      price: -10.0,
    },
  ],
  specifications: [{ specProperty: "", specValue: "" }],
  status: "NotAStatus",
  attachments: "invalidAttachment",
};

// invalidSupplyInvalidSpecification: An object with a specifications field that is invalid.
export const invalidSupplyInvalidSpecification = {
  ...validSupplyMinimum,
  specifications: [123, true, { specProperty: "", specValue: "" }],
};

// invalidSupplyInvalidSupplierPricing: An object with a supplierPricing array containing invalid entries.
export const invalidSupplyInvalidSupplierPricing = {
  ...validSupplyMinimum,
  supplierPricing: [
    { supplier: "not-an-object-id", price: 50.0 },
    {
      supplier: new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
      price: "free", // Price should be a number, not a string.
    },
  ],
};

// invalidSupplyStatus: An object where the status field is invalid.
export const invalidSupplyStatus = {
  ...validSupplyMinimum,
  status: "NotAStatus",
};

// invalidSupplySupplierPricing: An object where the supplierPricing field is not an array.
export const invalidSupplySupplierPricing = {
  ...validSupplyMinimum,
  supplierPricing: "not-an-array",
};

// ========= UPDATE MOCK DATA =========

export const validUpdateSupply = {
  name: 'Updated G.I. U-Bolt 8" x 3/8dia',
  description: "Updated description for the supply with enhanced features",
  categories: ["Hardware", "Fasteners", "Premium"],
  unitMeasure: "pc",
  status: "Active",
};

export const validPartialUpdateSupply = {
  description: "Updated only the description field",
};

export const invalidUpdateSupply = {
  name: "", // Invalid: name should not be empty
  categories: 123, // Invalid: categories should be an array of strings
};
