// ========= VALID PR ITEMS =========

// Complete valid PR Item data
export const validPRItemComplete = {
  prItemID: "PRI-001",
  prID: "PR-001",
  supplyID: "SUP-001",
  supplierID: "SUPPLIER-001",
  itemDescription: "High-grade steel bolts for construction",
  quantity: 50,
  unitOfMeasurement: "pcs",
  unitPrice: 15.75,
  totalPrice: 787.5,
  deliveryAddress: "123 Construction Site Ave, Building A",
};

// Minimal valid PR Item data
export const validPRItemMinimum = {
  prItemID: "PRI-002",
  prID: "PR-002",
  supplyID: "SUP-002",
  supplierID: "SUPPLIER-002",
  itemDescription: "Basic screws",
  quantity: 100,
  unitOfMeasurement: "pcs",
  unitPrice: 0.5,
  deliveryAddress: "456 Warehouse St",
};

// Valid PR Item without totalPrice (should be optional)
export const validPRItemWithoutTotalPrice = {
  prItemID: "PRI-003",
  prID: "PR-003",
  supplyID: "SUP-003",
  supplierID: "SUPPLIER-003",
  itemDescription: "PVC pipes for plumbing",
  quantity: 25,
  unitOfMeasurement: "meters",
  unitPrice: 12.0,
  deliveryAddress: "789 Project Site Rd",
};

// ========= INVALID PR ITEMS =========

// Missing required fields
export const missingRequiredFieldsPRItem = {
  prItemID: "PRI-004",
  // Missing prID, supplyID, supplierID, itemDescription, quantity, unitOfMeasurement, unitPrice, deliveryAddress
};

// Empty string fields
export const invalidPRItemEmptyStrings = {
  prItemID: "",
  prID: "",
  supplyID: "",
  supplierID: "",
  itemDescription: "",
  quantity: 5,
  unitOfMeasurement: "",
  unitPrice: 100,
  deliveryAddress: "",
};

// Whitespace only fields
export const invalidPRItemWhitespaceFields = {
  prItemID: "   ",
  prID: "   ",
  supplyID: "   ",
  supplierID: "   ",
  itemDescription: "   ",
  quantity: 10,
  unitOfMeasurement: "   ",
  unitPrice: 50,
  deliveryAddress: "   ",
};

// Negative quantity
export const invalidPRItemNegativeQuantity = {
  prItemID: "PRI-005",
  prID: "PR-005",
  supplyID: "SUP-005",
  supplierID: "SUPPLIER-005",
  itemDescription: "Test Item with negative quantity",
  quantity: -5,
  unitOfMeasurement: "pcs",
  unitPrice: 25,
  deliveryAddress: "123 Test Address",
};

// Zero quantity
export const invalidPRItemZeroQuantity = {
  prItemID: "PRI-006",
  prID: "PR-006",
  supplyID: "SUP-006",
  supplierID: "SUPPLIER-006",
  itemDescription: "Test Item with zero quantity",
  quantity: 0,
  unitOfMeasurement: "pcs",
  unitPrice: 30,
  deliveryAddress: "456 Test Address",
};

// Negative unit price
export const invalidPRItemNegativeUnitPrice = {
  prItemID: "PRI-007",
  prID: "PR-007",
  supplyID: "SUP-007",
  supplierID: "SUPPLIER-007",
  itemDescription: "Test Item with negative unit price",
  quantity: 10,
  unitOfMeasurement: "pcs",
  unitPrice: -15,
  deliveryAddress: "789 Test Address",
};

// Negative total price
export const invalidPRItemNegativeTotalPrice = {
  prItemID: "PRI-008",
  prID: "PR-008",
  supplyID: "SUP-008",
  supplierID: "SUPPLIER-008",
  itemDescription: "Test Item with negative total price",
  quantity: 5,
  unitOfMeasurement: "pcs",
  unitPrice: 20,
  totalPrice: -100,
  deliveryAddress: "321 Test Address",
};

// Both negative values
export const invalidPRItemBothNegativeValues = {
  prItemID: "PRI-009",
  prID: "PR-009",
  supplyID: "SUP-009",
  supplierID: "SUPPLIER-009",
  itemDescription: "Test Item with both negative values",
  quantity: -3,
  unitOfMeasurement: "pcs",
  unitPrice: -25,
  deliveryAddress: "654 Test Address",
};

// ========= UPDATE TEST DATA =========

// Valid update data
export const validPRItemUpdate = {
  itemDescription: "Updated item description",
  quantity: 75,
  unitPrice: 18.5,
  deliveryAddress: "Updated delivery address",
};

// Empty update data (should fail)
export const emptyPRItemUpdate = {};

// Update with restricted fields (should fail)
export const restrictedPRItemUpdate = {
  prItemID: "PRI-NEW",
  prID: "PR-NEW",
  createdAt: new Date(),
  updatedAt: new Date(),
  itemDescription: "Updated description",
};

// Valid partial update
export const validPRItemPartialUpdate = {
  quantity: 200,
  unitPrice: 22.75,
};
