// /constants.ts
export const roleList = [
  "Super Administrator",
  "Administrator",
  "Manager",
  "Staff",
  "Auditor",
  "Requester",
  "Approver",
  "Purchaser",
  "Inventory Clerk",
  "Accountant",
  "Project Lead",
  "Guest",
] as const;

export const statusList = ["Active", "Inactive"] as const;

// Default values
export const defaultRole = "Staff";
export const defaultStatus = "Active";
export const superAdmin = "Super Administrator";