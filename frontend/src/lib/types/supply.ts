export type SupplyStatus = "Active" | "Inactive";

export type SupplierPricing = {
  supplier: string;
  price: number;
  priceValidity: string;
  unitQuantity: number;
  unitPrice: number;
};

export type Specification = {
  specProperty: string;
  specValue: string | number;
};

export type Supply = {
  supplyID: string;
  name: string;
  description: string;
  categories: string[];
  unitMeasure: string;
  supplierPricing: SupplierPricing[];
  specifications: Specification[];
  status?: SupplyStatus;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
};
