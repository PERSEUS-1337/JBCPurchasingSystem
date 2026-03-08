export type SupplierStatus = "Active" | "Inactive";

export type ContactPerson = {
  name: string;
  contactNumber: string;
  email?: string;
  position?: string;
};

export type Supplier = {
  _id?: string;
  supplierID: string;
  name: string;
  contactNumbers: string[];
  emails?: string[];
  contactPersons?: ContactPerson[];
  address: string;
  documentation?: string[];
  primaryTag: string;
  tags: string[];
  status?: SupplierStatus;
  supplies?: string[];
  createdAt?: string;
  updatedAt?: string;
};
