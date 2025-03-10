import mongoose from "mongoose";

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
  suppliers: [
    new mongoose.Types.ObjectId("60c72b2f5f1b2c001c8e4d75"),
  ], 
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

export const missingRequiredFieldsSupply = {
  name: "Incomplete Supply",
};

export const invalidSupplyCategories = {
  ...validSupplyComplete,
  categories: "Not an array", // Invalid type
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
