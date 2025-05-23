import { SUPPLIER_IDS } from "./mockSuppliers";

// ========= VALID SUPPLIES =========

// Minimal valid supply data
export const validSupplyMinimum = {
  supplyID: "SPL-1002",
  name: "Steel Bolt M10",
  description: "Steel Bolt M10 standard size",
  categories: ["Fasteners"],
  unitMeasure: "pc",
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: 50.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: 50.0,
    },
  ],
  specifications: [{ specProperty: "Size", specValue: "M10" }],
  attachments: [],
};

// A complete supply record built from the minimum and additional fields
export const validSupplyComplete = {
  ...validSupplyMinimum,
  supplyID: "SPL-1001",
  name: 'G.I. U-Bolt 8" x 3/8dia',
  description: 'G.I. U-Bolt 8" x 3/8dia with double washer and nut',
  categories: ["Hardware", "Fasteners"],
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: 500.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 5,
      unitPrice: 100.0,
    },
    {
      supplier: SUPPLIER_IDS.SUPPLIER_2,
      price: 690.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 5,
      unitPrice: 138.0,
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
    supplierPricing: [
      {
        supplier: SUPPLIER_IDS.SUPPLIER_3,
        price: 125.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 10,
        unitPrice: 12.5,
      },
      {
        supplier: SUPPLIER_IDS.SUPPLIER_4,
        price: 150.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 10,
        unitPrice: 15.0,
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
    supplierPricing: [
      {
        supplier: SUPPLIER_IDS.SUPPLIER_5,
        price: 250.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 1,
        unitPrice: 250.0,
      },
      {
        supplier: SUPPLIER_IDS.SUPPLIER_6,
        price: 280.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 1,
        unitPrice: 280.0,
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
    supplierPricing: [
      {
        supplier: SUPPLIER_IDS.SUPPLIER_7,
        price: 50.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 100,
        unitPrice: 0.5,
      },
      {
        supplier: SUPPLIER_IDS.SUPPLIER_8,
        price: 60.0,
        priceValidity: new Date("2024-12-31"),
        unitQuantity: 100,
        unitPrice: 0.6,
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
export const {
  supplyID,
  name,
  description,
  categories,
  unitMeasure,
  supplierPricing,
  ...missingRequiredFieldsSupply
} = validSupplyComplete;

export const invalidSupplyComplete = {
  supplyID: "BAD-1001",
  name: "",
  description: "",
  categories: [],
  unitMeasure: "",
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: -10.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: -10.0,
    },
  ],
  specifications: [{ specProperty: 69, specValue: "Invalid" }],
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
    {
      supplier: "not-an-object-id",
      price: 50.0,
      priceValidity: new Date(),
      unitQuantity: 1,
      unitPrice: 50.0,
    },
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: "free", // Price should be a number, not a string.
      priceValidity: new Date(),
      unitQuantity: 1,
      unitPrice: "free",
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

// ========= NEW INVALID SUPPLIES FOR TEST CASES =========

// invalidSupplyNonExistentSupplier: A supply with a non-existent supplier ID
export const invalidSupplyNonExistentSupplier = {
  ...validSupplyMinimum,
  supplierPricing: [
    {
      supplier: "507f1f77bcf86cd799439011", // A non-existent ObjectId
      price: 50.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: 50.0,
    },
  ],
};

// invalidSupplyDuplicateSuppliers: A supply with duplicate suppliers in pricing
export const invalidSupplyDuplicateSuppliers = {
  ...validSupplyMinimum,
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: 50.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: 50.0,
    },
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1, // Same supplier as above
      price: 60.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: 60.0,
    },
  ],
};

// invalidSupplyLargePrice: A supply with an extremely large price
export const invalidSupplyLargePrice = {
  ...validSupplyMinimum,
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: Number.MAX_VALUE, // Extremely large price
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 1,
      unitPrice: Number.MAX_VALUE,
    },
  ],
};

// invalidSupplyZeroQuantity: A supply with zero unit quantity
export const invalidSupplyZeroQuantity = {
  ...validSupplyMinimum,
  supplierPricing: [
    {
      supplier: SUPPLIER_IDS.SUPPLIER_1,
      price: 50.0,
      priceValidity: new Date("2024-12-31"),
      unitQuantity: 0, // Invalid unit quantity
      unitPrice: 50.0,
    },
  ],
};

// invalidSupplyEmptySpecifications: A supply with empty specifications
export const invalidSupplyEmptySpecifications = {
  ...validSupplyMinimum,
  specifications: [], // Empty specifications
};

// invalidSupplyEmptyPricing: A supply with empty supplier pricing
export const invalidSupplyEmptyPricing = {
  ...validSupplyMinimum,
  supplierPricing: [], // Empty supplier pricing
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

// ========= SUPPLIER PRICING MOCK DATA =========

export const validSupplierPricingUpdate = {
  price: 150.0,
  priceValidity: new Date("2024-12-31"),
  unitQuantity: 10,
  unitPrice: 15.0,
};

export const invalidSupplierPricingUpdate = {
  price: -150.0,
  priceValidity: "invalid-date",
  unitQuantity: 0,
  unitPrice: -15.0,
};

export const validNewSupplierPricing = {
  supplier: SUPPLIER_IDS.SUPPLIER_3,
  price: 100.0,
  priceValidity: new Date("2024-12-31"),
  unitQuantity: 5,
  unitPrice: 20.0,
};

export const invalidNewSupplierPricing = {
  supplier: "invalid-supplier-id",
  price: -100.0,
  priceValidity: "invalid-date",
  unitQuantity: 0,
  unitPrice: -20.0,
};
