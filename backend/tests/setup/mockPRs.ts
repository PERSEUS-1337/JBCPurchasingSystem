import mongoose from "mongoose";

// Generate mock ObjectIds for testing
const mockObjectId = () => new mongoose.Types.ObjectId();

// ========= VALID PRs =========

// Complete valid PR data
export const validPRComplete = {
  prID: "PR-001",
  projCode: "PC-001",
  projName: "Project Alpha",
  projClient: "Client A",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "User1",
  recommendedBy: "Manager1",
  approvedBy: "Manager2",
  prStatus: "Approved" as const,
  itemsRequested: [mockObjectId(), mockObjectId()],
  totalCost: 1500.5,
  justification: "Need items for project completion.",
};

// Minimal valid PR data
export const validPRMinimum = {
  prID: "PR-002",
  projCode: "PC-002",
  projName: "Project Beta",
  projClient: "Client B",
  dateRequested: new Date("2024-01-10"),
  dateRequired: new Date("2024-02-10"),
  requestedBy: "User2",
  approvedBy: "Manager3",
  prStatus: "Draft" as const,
  totalCost: 0,
};

// Valid PR with string dates (should be transformed)
export const validPRWithStringDates = {
  prID: "PR-003",
  projCode: "PC-003",
  projName: "Project Gamma",
  projClient: "Client C",
  dateRequested: "2024-01-20",
  dateRequired: "2024-02-20",
  requestedBy: "User3",
  approvedBy: "Manager4",
  prStatus: "Submitted" as const,
  totalCost: 750.25,
};

// ========= INVALID PRs =========

// Missing required fields
export const missingRequiredFieldsPR = {
  // Missing prID, projCode, projName, projClient, dateRequired, requestedBy, approvedBy, prStatus, totalCost
  dateRequested: new Date(),
};

// Invalid PR status
export const invalidPRStatus = {
  prID: "PR-004",
  projCode: "PC-004",
  projName: "Project Delta",
  projClient: "Client D",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "User4",
  approvedBy: "Manager5",
  prStatus: "InvalidStatus",
  totalCost: 1000,
};

// Invalid date format
export const invalidPRDate = {
  prID: "PR-005",
  projCode: "PC-005",
  projName: "Project Epsilon",
  projClient: "Client E",
  dateRequested: "invalid-date",
  dateRequired: new Date("2024-02-15"),
  requestedBy: "User5",
  approvedBy: "Manager6",
  prStatus: "Draft" as const,
  totalCost: 500,
};

// Negative total cost
export const invalidPRNegativeCost = {
  prID: "PR-006",
  projCode: "PC-006",
  projName: "Project Zeta",
  projClient: "Client F",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "User6",
  approvedBy: "Manager7",
  prStatus: "Draft" as const,
  totalCost: -100,
};

// Empty string fields
export const invalidPREmptyStrings = {
  prID: "",
  projCode: "",
  projName: "",
  projClient: "",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "",
  approvedBy: "",
  prStatus: "Draft" as const,
  totalCost: 1000,
};

// Whitespace only fields
export const invalidPRWhitespaceFields = {
  prID: "   ",
  projCode: "   ",
  projName: "   ",
  projClient: "   ",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "   ",
  approvedBy: "   ",
  prStatus: "Draft" as const,
  totalCost: 1000,
};

// Invalid ObjectIds in itemsRequested
export const invalidPRInvalidObjectIds = {
  prID: "PR-007",
  projCode: "PC-007",
  projName: "Project Eta",
  projClient: "Client G",
  dateRequested: new Date("2024-01-15"),
  dateRequired: new Date("2024-02-15"),
  requestedBy: "User7",
  approvedBy: "Manager8",
  prStatus: "Draft" as const,
  itemsRequested: ["invalid-objectid", "another-invalid-id"],
  totalCost: 1000,
};

// ========= UPDATE TEST DATA =========

// Valid update data
export const validPRUpdate = {
  projName: "Updated Project Name",
  projClient: "Updated Client",
  totalCost: 2000,
  justification: "Updated justification",
};

// Empty update data (should fail)
export const emptyPRUpdate = {};

// Update with restricted fields (should fail)
export const restrictedPRUpdate = {
  prID: "PR-NEW",
  createdAt: new Date(),
  updatedAt: new Date(),
  itemsRequested: [mockObjectId()],
  projName: "Updated Project",
};

// ========= PR ITEM TEST DATA =========

// Valid PR Item
export const validPRItem = {
  prItemID: "PRI-001",
  prID: "PR-001",
  supplyID: "SUP-001",
  supplierID: "SUPPLIER-001",
  itemDescription: "Test Item",
  quantity: 5,
  unitOfMeasurement: "pcs",
  unitPrice: 100,
  deliveryAddress: "123 Test St",
};

// Invalid PR Item - missing required fields
export const invalidPRItemMissingFields = {
  prItemID: "PRI-002",
  // Missing required fields
};

// Invalid PR Item - negative values
export const invalidPRItemNegativeValues = {
  prItemID: "PRI-003",
  prID: "PR-001",
  supplyID: "SUP-001",
  supplierID: "SUPPLIER-001",
  itemDescription: "Test Item",
  quantity: -5,
  unitOfMeasurement: "pcs",
  unitPrice: -100,
  deliveryAddress: "123 Test St",
};

// Invalid PR Item - zero quantity
export const invalidPRItemZeroQuantity = {
  prItemID: "PRI-004",
  prID: "PR-001",
  supplyID: "SUP-001",
  supplierID: "SUPPLIER-001",
  itemDescription: "Test Item",
  quantity: 0,
  unitOfMeasurement: "pcs",
  unitPrice: 100,
  deliveryAddress: "123 Test St",
};

// Invalid PR Item - empty strings
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
