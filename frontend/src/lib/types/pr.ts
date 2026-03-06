export type PRStatus =
  | "Draft"
  | "Recommended"
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type PRItem = {
  prItemID: string;
  prID: string;
  supplyID: string;
  supplierID: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasurement: string;
  unitPrice: number;
  totalPrice?: number;
  deliveryAddress: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PurchaseRequest = {
  prID: string;
  projCode: string;
  projName: string;
  projClient: string;
  dateRequested?: string;
  dateRequired: string;
  requestedBy: string;
  recommendedBy?: string;
  approvedBy?: string;
  prStatus: PRStatus;
  itemsRequested?: string[];
  totalCost: number;
  justification?: string;
  createdAt?: string;
  updatedAt?: string;
};
