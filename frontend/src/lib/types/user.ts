export type UserRole =
  | "Super Administrator"
  | "Manager"
  | "Staff"
  | "Requester"
  | "Chief Officer"
  | "Purchaser";

export type UserStatus = "Active" | "Inactive";

export type User = {
  fullname: string;
  email: string;
  position: string;
  department: string;
  createdAt: string;
  updatedAt: string;
};

export type UserAdminView = {
  userID: string;
  fullname: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
