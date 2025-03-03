// /constants.ts
export const userRoleEnums = [
  "Super Administrator",
  "Manager",
  "Staff",
  "Requester",
  "Chief Officer",
  "Purchaser",
] as const;

export const userStatusEnums = ["Active", "Inactive"] as const;

// Default values
export const defaultUserRole = "Staff";
export const defaultUserStatus = "Active";
export const userSuperAdmin = "Super Administrator";
