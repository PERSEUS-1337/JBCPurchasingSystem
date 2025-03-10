import mongoose from "mongoose";

// ========= VALID SUPPLIES =========
export const validSupplyComplete = {
  supplyID: "SPL-1001",
  name: 'G.I. U-Bolt 8" x 3/8dia',
  description: 'G.I. U-Bolt 8" x 3/8dia with double washer and nut',
  categories: ["Hardware", "Fasteners"],
  unitMeasure: "pc",
  suppliers: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d76"),
  ], // ObjectId references
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
  status: "Active",
  attachments: [],
};

export const validSuppliesList = [
  {
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
export const missingRequiredFieldsSupply = {
  name: "Incomplete Supply",
};

export const invalidSupplyCategories = {
  ...validSupplyComplete,
  categories: 123, // Invalid type
};

export const invalidSupplySupplierPricing = {
  ...validSupplyComplete,
  supplierPricing: [
    {
      supplier: "Invalid ObjectId", // Should be a valid ObjectId
      price: "Fifty", // Should be a number
    },
  ],
};

export const invalidSupplyInvalidSpecification = {
  supplyID: "SPL-1003",
  name: "Widget D",
  description: "A widget with invalid specs",
  categories: ["Electronics"],
  unitMeasure: "pieces",
  suppliers: [new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75")],
  specifications: [
    {
      specProperty: "", // Invalid: missing required field
      specValue: undefined, // Invalid: missing required field
    },
  ],
};

export const invalidSupplyInvalidSupplierPricing = {
  supplyID: "SPL-1004",
  name: "Widget E",
  description: "A widget with invalid pricing",
  categories: ["Electronics"],
  unitMeasure: "pieces",
  suppliers: [new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75")],
  supplierPricing: [
    {
      supplier: "invalidObjectId", // Invalid ObjectId
      price: -10, // Invalid: negative price
    },
  ],
};

export const invalidSupplyStatus = {
  supplyID: "SPL-1005",
  name: "Widget F",
  description: "A widget with invalid status",
  categories: ["Electronics"],
  unitMeasure: "pieces",
  suppliers: [new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75")],
  status: "Invalid", // Invalid status
};
