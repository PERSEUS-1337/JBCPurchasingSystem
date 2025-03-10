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
