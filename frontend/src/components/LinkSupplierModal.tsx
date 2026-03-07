"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { HttpError } from "@/lib/api/client";
import { linkSupplierWithPricing } from "@/lib/api/supplies";
import { getAllSuppliers } from "@/lib/api/suppliers";
import { Supplier } from "@/lib/types/supplier";

type LinkSupplierModalProps = {
  isOpen: boolean;
  supplyID: string;
  linkedSuppliers: Set<string>;
  onClose: () => void;
  onSuccess: () => void;
};

export function LinkSupplierModal({
  isOpen,
  supplyID,
  linkedSuppliers,
  onClose,
  onSuccess,
}: LinkSupplierModalProps) {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [price, setPrice] = useState(0);
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [priceValidity, setPriceValidity] = useState(new Date().toISOString().slice(0, 10));

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "for-linking"],
    queryFn: getAllSuppliers,
  });

  const availableSuppliers = useMemo(() => {
    const allSuppliers = suppliersQuery.data?.data ?? [];
    return allSuppliers.filter(
      (supplier: Supplier) => !linkedSuppliers.has(supplier._id || "")
    );
  }, [suppliersQuery.data, linkedSuppliers]);

  const linkMutation = useMutation({
    mutationFn: () =>
      linkSupplierWithPricing(supplyID, {
        supplier: selectedSupplier,
        price,
        priceValidity,
        unitQuantity,
        unitPrice,
      }),
    onSuccess: () => {
      toast.success("Supplier linked with pricing successfully");
      handleReset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to link supplier");
      }
    },
  });

  const handleReset = () => {
    setSelectedSupplier("");
    setPrice(0);
    setUnitQuantity(1);
    setUnitPrice(0);
    setPriceValidity(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (price !== unitPrice * unitQuantity) {
      toast.error("Pricing must satisfy price = unitPrice × unitQuantity");
      return;
    }

    linkMutation.mutate();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Link Supplier to Supply"
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
            isLoading={linkMutation.isPending}
          >
            Link Supplier
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
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Supplier
              </label>
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
                  value={unitQuantity}
                  onChange={(event) =>
                    setUnitQuantity(Number(event.target.value))
                  }
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
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(Number(event.target.value))}
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
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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

            <p className="text-xs text-neutral-500">
              Note: Total Price must equal Unit Price × Unit Quantity
            </p>
          </>
        )}
      </form>
    </Modal>
  );
}
