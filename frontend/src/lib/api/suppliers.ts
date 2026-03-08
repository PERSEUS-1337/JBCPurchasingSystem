import { ApiResponse } from "../types/api";
import { Supplier, SupplierStatus } from "../types/supplier";
import { del, get, patch, post } from "./client";

type SupplierPayload = {
  supplierID: string;
  name: string;
  contactNumbers: string[];
  emails?: string[];
  contactPersons?: Supplier["contactPersons"];
  address: string;
  primaryTag: string;
  tags: string[];
  documentation?: string[];
  status?: SupplierStatus;
  supplies?: string[];
};

type SupplierUpdatePayload = Partial<Omit<SupplierPayload, "supplierID">>;

export function getAllSuppliers() {
  return get<ApiResponse<Supplier[] | null>>("/supplier/");
}

export function searchSuppliers(query: string) {
  return get<ApiResponse<Supplier[] | null>>(`/supplier/search?query=${encodeURIComponent(query)}`);
}

export function getSupplierById(supplierID: string) {
  return get<ApiResponse<Supplier>>(`/supplier/${supplierID}`);
}

export function createSupplier(payload: SupplierPayload) {
  return post<ApiResponse<Supplier>>("/supplier/", payload);
}

export function updateSupplier(supplierID: string, payload: SupplierUpdatePayload) {
  return patch<ApiResponse<Supplier>>(`/supplier/${supplierID}`, payload);
}

export function updateSupplierStatus(supplierID: string, status: SupplierStatus) {
  return patch<ApiResponse<Supplier>>(`/supplier/${supplierID}/status`, { status });
}

export function deleteSupplier(supplierID: string) {
  return del<ApiResponse<Supplier>>(`/supplier/${supplierID}`);
}

export function getSuppliesOfSupplier(supplierID: string) {
  return get<ApiResponse<string[]>>(`/supplier/${supplierID}/supplies`);
}

export async function linkSupplyToSupplier(supplierID: string, supplyID: string) {
  try {
    return await post<ApiResponse<Supplier>>(`/supplier/${supplierID}/supplies`, { supplyID });
  } catch {
    const supplierResponse = await getSupplierById(supplierID);
    const existing = supplierResponse.data.supplies ?? [];

    if (existing.includes(supplyID)) {
      return supplierResponse;
    }

    return updateSupplier(supplierID, {
      supplies: [...existing, supplyID],
    });
  }
}

export async function unlinkSupplyFromSupplier(supplierID: string, supplyID: string) {
  try {
    return await del<ApiResponse<Supplier>>(`/supplier/${supplierID}/supplies/${supplyID}`);
  } catch {
    const supplierResponse = await getSupplierById(supplierID);
    const existing = supplierResponse.data.supplies ?? [];

    return updateSupplier(supplierID, {
      supplies: existing.filter((id) => id !== supplyID),
    });
  }
}
