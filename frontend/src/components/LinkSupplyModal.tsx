"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { HttpError } from "@/lib/api/client";
import { linkSupplierWithPricing } from "@/lib/api/supplies";
import { getAllSupplies } from "@/lib/api/supplies";
import { Supply } from "@/lib/types/supply";

type LinkSupplyModalProps = {
  isOpen: boolean;
  supplierID: string;
  supplierObjectId: string;
  linkedSupplies: Set<string>;
  onClose: () => void;
  onSuccess: () => void;
};

function getDefaultValidityDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function LinkSupplyModal({
  isOpen,
  supplierObjectId,
  linkedSupplies,
  onClose,
  onSuccess,
}: LinkSupplyModalProps) {
  const [selectedSupply, setSelectedSupply] = useState("");
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [priceValidity, setPriceValidity] = useState(getDefaultValidityDate());

  const totalPrice = Number((unitQuantity * unitPrice).toFixed(2));

  const suppliesQuery = useQuery({
    queryKey: ["supplies", "for-linking"],
    queryFn: getAllSupplies,
  });

  const availableSupplies = useMemo(() => {
    const allSupplies = suppliesQuery.data?.data ?? [];
    return allSupplies.filter(
      (supply: Supply) => !linkedSupplies.has(supply.supplyID)
    );
  }, [suppliesQuery.data, linkedSupplies]);

  const linkMutation = useMutation({
    mutationFn: (supplyID: string) =>
      linkSupplierWithPricing(supplyID, {
        supplier: supplierObjectId,
        price: totalPrice,
        priceValidity,
        unitQuantity,
        unitPrice,
      }),
    onSuccess: () => {
      toast.success("Supply linked with pricing successfully");
      handleReset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to link supply");
      }
    },
  });

  const handleReset = () => {
    setSelectedSupply("");
    setUnitQuantity(1);
    setUnitPrice(0);
    setPriceValidity(getDefaultValidityDate());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSupply) {
      toast.error("Please select a supply");
      return;
    }

    linkMutation.mutate(selectedSupply);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Link Supply to Supplier"
      onClose={handleClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const form = document.getElementById(
                "link-supply-form"
              ) as HTMLFormElement;
              if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
            }}
            isLoading={linkMutation.isPending}
          >
            Link Supply
          </Button>
        </div>
      }
    >
      <form id="link-supply-form" onSubmit={handleSubmit} className="space-y-4">
        {suppliesQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          <>
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              Default price validity is set to 30 days from today. You can still reduce or extend this date.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Supply
              </label>
              <select
                value={selectedSupply}
                onChange={(event) => setSelectedSupply(event.target.value)}
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                disabled={!availableSupplies.length}
              >
                <option value="">
                  {availableSupplies.length === 0
                    ? "No available supplies to link"
                    : "Select a supply"}
                </option>
                {availableSupplies.map((supply: Supply) => (
                  <option key={supply.supplyID} value={supply.supplyID}>
                    {supply.supplyID} — {supply.name}
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
