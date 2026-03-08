"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { HttpError } from "@/lib/api/client";
import { linkSupplierWithPricing, updateSupplierPricing } from "@/lib/api/supplies";
import { getAllSuppliers } from "@/lib/api/suppliers";
import { Supplier } from "@/lib/types/supplier";

type LinkSupplierModalMode = "link" | "edit";

type LinkSupplierModalProps = {
  isOpen: boolean;
  supplyID: string;
  linkedSuppliers: Set<string>;
  mode?: LinkSupplierModalMode;
  editData?: {
    supplierId: string;
    supplierLabel?: string;
    unitQuantity: number;
    unitPrice: number;
    priceValidity: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};

function getDefaultValidityDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function LinkSupplierModal({
  isOpen,
  supplyID,
  linkedSuppliers,
  mode = "link",
  editData,
  onClose,
  onSuccess,
}: LinkSupplierModalProps) {
  const isEditMode = mode === "edit";

  const [selectedSupplier, setSelectedSupplier] = useState(editData?.supplierId ?? "");
  const [unitQuantityInput, setUnitQuantityInput] = useState(`${editData?.unitQuantity ?? 1}`);
  const [unitPriceInput, setUnitPriceInput] = useState(
    editData?.unitPrice !== undefined ? `${editData.unitPrice}` : "",
  );
  const [priceValidity, setPriceValidity] = useState(
    editData?.priceValidity?.slice(0, 10) ?? getDefaultValidityDate(),
  );

  const unitQuantity = Number.parseFloat(unitQuantityInput);
  const unitPrice = Number.parseFloat(unitPriceInput);
  const safeUnitQuantity = Number.isFinite(unitQuantity) ? unitQuantity : 0;
  const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;

  const totalPrice = Number((safeUnitQuantity * safeUnitPrice).toFixed(2));

  useEffect(() => {
    setSelectedSupplier(editData?.supplierId ?? "");
    setUnitQuantityInput(`${editData?.unitQuantity ?? 1}`);
    setUnitPriceInput(editData?.unitPrice !== undefined ? `${editData.unitPrice}` : "");
    setPriceValidity(editData?.priceValidity?.slice(0, 10) ?? getDefaultValidityDate());
  }, [editData]);

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "for-linking"],
    queryFn: getAllSuppliers,
  });

  const availableSuppliers = useMemo(() => {
    const allSuppliers = suppliersQuery.data?.data ?? [];

    if (isEditMode && editData?.supplierId) {
      return allSuppliers.filter((supplier: Supplier) => supplier._id === editData.supplierId);
    }

    return allSuppliers.filter(
      (supplier: Supplier) => !linkedSuppliers.has(supplier._id || "")
    );
  }, [editData?.supplierId, isEditMode, suppliersQuery.data, linkedSuppliers]);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (isEditMode) {
        return updateSupplierPricing(supplyID, selectedSupplier, {
          price: totalPrice,
          priceValidity,
          unitQuantity: safeUnitQuantity,
          unitPrice: safeUnitPrice,
        });
      }

      return linkSupplierWithPricing(supplyID, {
        supplier: selectedSupplier,
        price: totalPrice,
        priceValidity,
        unitQuantity: safeUnitQuantity,
        unitPrice: safeUnitPrice,
      });
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Supplier pricing updated successfully" : "Supplier linked with pricing successfully");
      handleReset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error(isEditMode ? "Failed to update supplier pricing" : "Failed to link supplier");
      }
    },
  });

  const handleReset = () => {
    setSelectedSupplier(editData?.supplierId ?? "");
    setUnitQuantityInput(`${editData?.unitQuantity ?? 1}`);
    setUnitPriceInput(editData?.unitPrice !== undefined ? `${editData.unitPrice}` : "");
    setPriceValidity(editData?.priceValidity?.slice(0, 10) ?? getDefaultValidityDate());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (!Number.isFinite(unitQuantity) || !Number.isFinite(unitPrice)) {
      toast.error("Unit quantity and unit price are required");
      return;
    }

    submitMutation.mutate();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isEditMode ? "Edit Supplier Pricing" : "Link Supplier to Supply"}
      onClose={handleClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const form = document.getElementById(
                "link-supplier-form"
              ) as HTMLFormElement;
              if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
            }}
            isLoading={submitMutation.isPending}
          >
            {isEditMode ? "Save Changes" : "Link Supplier"}
          </Button>
        </div>
      }
    >
      <form id="link-supplier-form" onSubmit={handleSubmit} className="space-y-4">
        {suppliersQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          <>
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              {isEditMode
                ? "Editing mode: update pricing details for this linked supplier record."
                : "Default price validity is set to 30 days from today. You can still reduce or extend this date."}
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Supplier
              </label>
              {isEditMode ? (
                <input
                  value={editData?.supplierLabel || selectedSupplier}
                  disabled
                  className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
                />
              ) : (
                <select
                  value={selectedSupplier}
                  onChange={(event) => setSelectedSupplier(event.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  disabled={!availableSuppliers.length}
                >
                  <option value="">
                    {availableSuppliers.length === 0
                      ? "No available suppliers to link"
                      : "Select a supplier"}
                  </option>
                  {availableSuppliers.map((supplier: Supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierID} — {supplier.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-neutral-700">
                  Unit Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={unitQuantityInput}
                  onChange={(event) => setUnitQuantityInput(event.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-700">
                  Unit Price
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={unitPriceInput}
                  onChange={(event) => setUnitPriceInput(event.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-700">
                  Total Price
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={totalPrice}
                  disabled
                  className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-700">
                  Price Validity Date
                </label>
                <input
                  type="date"
                  value={priceValidity}
                  onChange={(event) => setPriceValidity(event.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-neutral-500">Total Price is automatically computed as Unit Price × Unit Quantity.</p>
          </>
        )}
      </form>
    </Modal>
  );
}
