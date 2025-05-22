import { SUPPLIER_IDS } from "./mockSuppliers";

// ========= BASE VALID REQUEST =========
const baseValidRequest = {
  prRefNumber: "PR-1001",
  projCode: "PROJ-001",
  projName: "Project Alpha",
  projClient: "Client A",
  dateRequested: new Date("2025-01-15T10:00:00Z"),
  dateRequired: new Date("2025-02-01T10:00:00Z"),
  requestedBy: "USER_001",
  recommendedBy: "USER_002",
  approvedBy: "USER_003",
  status: "Approved",
  itemsRequested: [
    {
      prItemID: "PRI-1001",
      prRefNumber: "PR-1001",
      itemID: "SPL-1001",
      supplierID: SUPPLIER_IDS.SUPPLIER_1.toString(),
      itemDescription: 'G.I. U-Bolt 8" x 3/8dia',
      quantity: 5,
      unitOfMeasurement: "pc",
      unitPrice: 100.0,
      totalPrice: 500.0,
      deliveryAddress: "Warehouse A",
    },
  ],
  totalCost: 500.0,
  justification: "Required for building structural components",
};

// ========= 1. MINIMAL VALID REQUEST =========
export const validPurchaseRequestMinimum = {
  ...baseValidRequest,
  // No additional fields - this is the minimum
};

// ========= 2. COMPLETE VALID REQUEST =========
export const validPurchaseRequestComplete = {
  ...baseValidRequest,
  prRefNumber: "PR-1002", // New unique ID
  itemsRequested: [
    {
      ...baseValidRequest.itemsRequested[0],
      prItemID: "PRI-1002",
      prRefNumber: "PR-1002",
      itemID: "SPL-1002",
      supplierID: SUPPLIER_IDS.SUPPLIER_2.toString(),
      itemDescription: 'Stainless Steel Hex Bolt 1/2" x 2"',
      quantity: 10,
      unitPrice: 12.5,
      totalPrice: 125.0,
    },
    {
      prItemID: "PRI-1003",
      prRefNumber: "PR-1002",
      itemID: "SPL-1003",
      supplierID: SUPPLIER_IDS.SUPPLIER_3.toString(),
      itemDescription: 'PVC Pipe 4" x 10ft',
      quantity: 2,
      unitOfMeasurement: "pc",
      unitPrice: 250.0,
      totalPrice: 500.0,
      deliveryAddress: "On-Site",
    },
  ],
  totalCost: 625.0, // Sum of all items
  logs: [
    { action: "Created", timestamp: new Date("2025-01-20T12:01:00Z") },
    { action: "Approved", timestamp: new Date("2025-01-21T09:00:00Z") },
  ],
};

// ========= 3. FULLY INVALID REQUEST =========
export const invalidPurchaseRequest = {
  prRefNumber: "", // Empty
  projCode: "!@#$", // Invalid chars
  projName: 12345, // Wrong type
  projClient: undefined, // Missing
  dateRequested: "not-a-date", // Invalid format
  dateRequired: new Date("2020-01-01"), // Past date
  requestedBy: " ", // Whitespace
  recommendedBy: null, // Null
  approvedBy: "USER_000", // Invalid format
  status: "NotAStatus", // Not in enum
  itemsRequested: [
    // All items invalid
    {
      prItemID: undefined,
      prRefNumber: 123,
      itemID: false,
      supplierID: "BAD_ID",
      itemDescription: "",
      quantity: -10,
      unitOfMeasurement: 99,
      unitPrice: "free",
      totalPrice: NaN,
      deliveryAddress: {},
    },
  ],
  totalCost: -1000, // Negative
  justification: {}, // Wrong type
  logs: "invalid", // Wrong type
};

// ========= UPDATE MOCK DATA =========

// Valid update to a purchase request
export const validUpdatePurchaseRequest = {
  projName: "Updated Project Alpha",
  justification: "Updated justification text for additional requirements",
  status: "Approved",
};

// Valid partial update to a purchase request
export const validPartialUpdatePurchaseRequest = {
  justification: "Changed justification only",
};

// An invalid update where fields have unacceptable values
export const invalidUpdatePurchaseRequest = {
  projName: "", // Invalid: projName should not be empty
  status: 123, // Invalid: status should be a string
};
