// /constants.ts
export const roleList = [
  "Super Administrator",
  "Manager",
  "Staff",
  "Requester",
  "Chief Officer",
  "Purchaser",
] as const;

export const statusList = ["Active", "Inactive"] as const;

// Default values
export const defaultRole = "Staff";
export const defaultStatus = "Active";
export const superAdmin = "Super Administrator";