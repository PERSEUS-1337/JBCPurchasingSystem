export const supplyStatusEnums = ["Active", "Inactive"] as const;
export const defaultSupplyStatus = "Active";
export const supplyRestrictedFields = [
  "supplyID",
  "createdAt",
  "updatedAt",
  "supplierPricing", // Updates handled by a dedicated API
  "suppliers", // Updates handled by a dedicated API
  "specifications", // Updates handled by a dedicated API if needed
] as const;
