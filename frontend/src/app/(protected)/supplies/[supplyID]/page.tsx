"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { LinkSupplierModal } from "@/components/LinkSupplierModal";
import { HttpError } from "@/lib/api/client";
import {
  deleteSupply,
  getSupplyById,
  removeSupplierPricing,
  updateSupplierPricing,
  updateSupply,
  updateSupplyStatus,
} from "@/lib/api/supplies";
import { getAllSuppliers } from "@/lib/api/suppliers";
import { SupplyStatus } from "@/lib/types/supply";

function splitValues(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toCsv(value?: string[]) {
  return (value ?? []).join(", ");
}

type PricingFormState = {
  supplier: string;
  price: number;
  priceValidity: string;
  unitQuantity: number;
  unitPrice: number;
};

export default function SupplyDetailPage() {
  const params = useParams<{ supplyID: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const supplyID = params.supplyID;

  const supplyQuery = useQuery({
    queryKey: ["supply", supplyID],
    queryFn: () => getSupplyById(supplyID),
    enabled: Boolean(supplyID),
  });

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "for-supply-detail"],
    queryFn: getAllSuppliers,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("");
  const [attachments, setAttachments] = useState("");
  const [editablePricing, setEditablePricing] = useState<PricingFormState[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const supply = supplyQuery.data?.data;

  useEffect(() => {
    if (!supply) {
      return;
    }

    setName(supply.name);
    setDescription(supply.description);
    setCategories(toCsv(supply.categories));
    setUnitMeasure(supply.unitMeasure);
    setAttachments(toCsv(supply.attachments));
    setEditablePricing(
      supply.supplierPricing.map((pricing) => ({
        supplier: pricing.supplier,
        price: pricing.price,
        unitPrice: pricing.unitPrice,
        unitQuantity: pricing.unitQuantity,
        priceValidity: pricing.priceValidity,
      })),
    );
  }, [supply]);

  const supplierNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const supplier of suppliersQuery.data?.data ?? []) {
      map.set(supplier._id ?? "", `${supplier.supplierID} — ${supplier.name}`);
    }
    return map;
  }, [suppliersQuery.data]);

  const linkedSupplierIds = useMemo(
    () => new Set(supply?.supplierPricing.map((p) => p.supplier) ?? []),
    [supply]
  );

  const invalidateSupplyQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["supply", supplyID] });
    queryClient.invalidateQueries({ queryKey: ["supplies"] });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSupply(supplyID, {
        name,
        description,
        categories: splitValues(categories),
        unitMeasure,
        attachments: splitValues(attachments),
      }),
    onSuccess: () => {
      toast.success("Supply updated");
      invalidateSupplyQueries();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update supply");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: SupplyStatus) => updateSupplyStatus(supplyID, status),
    onSuccess: () => {
      toast.success("Supply status updated");
      invalidateSupplyQueries();
    },
    onError: () => {
      toast.error("Failed to update supply status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSupply(supplyID),
    onSuccess: () => {
      toast.success("Supply deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      router.push("/supplies");
    },
    onError: () => {
      toast.error("Failed to delete supply");
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ supplier, price, unitPrice, unitQuantity, priceValidity }: PricingFormState) =>
      updateSupplierPricing(supplyID, supplier, { price, unitPrice, unitQuantity, priceValidity }),
    onSuccess: () => {
      toast.success("Supplier pricing updated");
      invalidateSupplyQueries();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update supplier pricing");
      }
    },
  });

  const removePricingMutation = useMutation({
    mutationFn: (supplier: string) => removeSupplierPricing(supplyID, supplier),
    onSuccess: () => {
      toast.success("Supplier pricing removed");
      invalidateSupplyQueries();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to remove supplier pricing");
      }
    },
  });

  const handleSupplyUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (splitValues(categories).length === 0) {
      toast.error("Provide at least one category");
      return;
    }

    updateMutation.mutate();
  };

  const updateEditablePricing = (index: number, value: Partial<PricingFormState>) => {
    setEditablePricing((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...value } : item)));
  };

  if (supplyQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (supplyQuery.isError || !supply) {
    return (
      <PageLayout title="Supply Details" description="Unable to load supply information.">
        <EmptyState title="Supply not found" description="The requested supply could not be loaded." />
      </PageLayout>
    );
  }

  const currentStatus = supply.status ?? "Active";
  const nextStatus: SupplyStatus = currentStatus === "Active" ? "Inactive" : "Active";

  return (
    <PageLayout
      title={`Supply: ${supply.supplyID}`}
      description="Update supply master data and manage supplier pricing records."
      action={
        <Link href="/supplies" className="text-sm text-neutral-700 underline underline-offset-2">
          Back to supplies
        </Link>
      }
    >
      <form onSubmit={handleSupplyUpdate} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={currentStatus === "Inactive" ? "muted" : "success"}>{currentStatus}</Badge>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={statusMutation.isPending}
            onClick={() => statusMutation.mutate(nextStatus)}
          >
            Set {nextStatus}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Supply ID</label>
            <input
              value={supply.supplyID}
              disabled
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Categories (comma-separated)</label>
            <input
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Unit Measure</label>
            <input
              value={unitMeasure}
              onChange={(event) => setUnitMeasure(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Attachment Links (comma-separated)</label>
            <input
              value={attachments}
              onChange={(event) => setAttachments(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <section className="space-y-3 rounded-md border border-neutral-200 p-4">
          <h2 className="text-base font-semibold text-neutral-900">Specifications</h2>

          {supply.specifications.length === 0 ? (
            <EmptyState title="No specifications" description="No specification details are available." />
          ) : (
            <ul className="space-y-2">
              {supply.specifications.map((specification, index) => (
                <li key={`${specification.specProperty}-${index}`} className="rounded-md border border-neutral-200 px-3 py-2 text-sm">
                  <span className="font-medium text-neutral-900">{specification.specProperty}: </span>
                  <span className="text-neutral-700">{`${specification.specValue}`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-md border border-neutral-200 p-4">
          <h2 className="text-base font-semibold text-neutral-900">Supplier Pricing</h2>

          {supply.supplierPricing.length === 0 ? (
            <EmptyState title="No supplier pricing" description="Add supplier pricing to make this supply purchasable." />
          ) : (
            <ul className="space-y-2">
              {editablePricing.map((pricing, index) => (
                <li key={`${pricing.supplier}-${index}`} className="space-y-2 rounded-md border border-neutral-200 p-3">
                  <p className="text-sm font-medium text-neutral-900">
                    Supplier: {supplierNameMap.get(pricing.supplier) ?? "Unknown supplier"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Supplier record linked by internal ID in pricing backend mapping.
                  </p>
                  <div className="grid gap-2 md:grid-cols-4">
                    <label className="space-y-1 text-xs text-neutral-600">
                      <span className="block">Unit Quantity</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={pricing.unitQuantity}
                        onChange={(event) =>
                          updateEditablePricing(index, { unitQuantity: Number(event.target.value) })
                        }
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-neutral-600">
                      <span className="block">Unit Price</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={pricing.unitPrice}
                        onChange={(event) => updateEditablePricing(index, { unitPrice: Number(event.target.value) })}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-neutral-600">
                      <span className="block">Total Price</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={pricing.price}
                        onChange={(event) => updateEditablePricing(index, { price: Number(event.target.value) })}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-neutral-600">
                      <span className="block">Price Validity Date</span>
                      <input
                        type="date"
                        value={pricing.priceValidity.slice(0, 10)}
                        onChange={(event) => updateEditablePricing(index, { priceValidity: event.target.value })}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={updatePricingMutation.isPending}
                      onClick={() => {
                        if (pricing.price !== pricing.unitPrice * pricing.unitQuantity) {
                          toast.error("Pricing must satisfy price = unitPrice × unitQuantity");
                          return;
                        }

                        updatePricingMutation.mutate({
                          supplier: pricing.supplier,
                          price: pricing.price,
                          unitPrice: pricing.unitPrice,
                          unitQuantity: pricing.unitQuantity,
                          priceValidity: pricing.priceValidity,
                        });
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      isLoading={removePricingMutation.isPending}
                      onClick={() => removePricingMutation.mutate(pricing.supplier)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsLinkModalOpen(true)}
          >
            Link Supplier with Pricing
          </Button>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete Supply
          </Button>
        </div>
      </form>

      <LinkSupplierModal
        isOpen={isLinkModalOpen}
        supplyID={supplyID}
        linkedSuppliers={linkedSupplierIds}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={() => invalidateSupplyQueries()}
      />
    </PageLayout>
  );
}
