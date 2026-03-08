import { ApiResponse } from "../types/api";
import { SupplierPricing, Supply, SupplyStatus } from "../types/supply";
import { del, get, patch, post } from "./client";

type SupplyPayload = {
  supplyID: string;
  name: string;
  description: string;
  categories: string[];
  unitMeasure: string;
  supplierPricing: SupplierPricing[];
  specifications: Supply["specifications"];
  status?: SupplyStatus;
  attachments?: string[];
};

type SupplyUpdatePayload = Partial<
  Omit<SupplyPayload, "supplyID" | "supplierPricing" | "specifications">
>;

type SupplierPricingPayload = {
  supplier: string;
  price: number;
  priceValidity: string;
  unitQuantity: number;
  unitPrice: number;
};

export function getAllSupplies() {
  return get<ApiResponse<Supply[] | null>>("/supply/");
}

export function searchSupplies(query: string) {
  return get<ApiResponse<Supply[] | null>>(
    `/supply/search?query=${encodeURIComponent(query)}`,
  );
}

export function getSupplyById(supplyID: string) {
  return get<ApiResponse<Supply>>(`/supply/${supplyID}`);
}

export function createSupply(payload: SupplyPayload) {
  return post<ApiResponse<Supply>>("/supply/", payload);
}

export function updateSupply(supplyID: string, payload: SupplyUpdatePayload) {
  return patch<ApiResponse<Supply>>(`/supply/${supplyID}`, payload);
}

export function updateSupplyStatus(supplyID: string, status: SupplyStatus) {
  return patch<ApiResponse<Supply>>(`/supply/${supplyID}/status`, { status });
}

export function deleteSupply(supplyID: string) {
  return del<ApiResponse<Supply>>(`/supply/${supplyID}`);
}

export function getSuppliersOfSupply(supplyID: string) {
  return get<ApiResponse<string[]>>(`/supply/${supplyID}/suppliers`);
}

export function linkSupplierWithPricing(
  supplyID: string,
  payload: SupplierPricingPayload,
) {
  return post<ApiResponse<Supply>>(
    `/supply/${supplyID}/link-supplier`,
    payload,
  );
}

export function addSupplierPricing(
  supplyID: string,
  payload: SupplierPricingPayload,
) {
  return post<ApiResponse<Supply>>(
    `/supply/${supplyID}/supplier-pricing`,
    payload,
  );
}

export function updateSupplierPricing(
  supplyID: string,
  supplier: string,
  payload: Omit<SupplierPricingPayload, "supplier">,
) {
  return patch<ApiResponse<Supply>>(
    `/supply/${supplyID}/supplier-pricing/${supplier}`,
    payload,
  );
}

export function removeSupplierPricing(supplyID: string, supplier: string) {
  return del<ApiResponse<Supply>>(
    `/supply/${supplyID}/supplier-pricing/${supplier}`,
  );
}
