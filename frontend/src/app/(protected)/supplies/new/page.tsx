"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createSupply, getAllSupplies } from "@/lib/api/supplies";
import { getAllSuppliers } from "@/lib/api/suppliers";
import { HttpError } from "@/lib/api/client";
import { Specification, SupplierPricing } from "@/lib/types/supply";

type SupplierPricingForm = Omit<SupplierPricing, "price" | "unitQuantity" | "unitPrice"> & {
  price: string;
  unitQuantity: string;
  unitPrice: string;
};

function splitValues(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function defaultSpecification(): Specification {
  return {
    specProperty: "",
    specValue: "",
  };
}

function defaultSupplierPricing(supplier = ""): SupplierPricingForm {
  return {
    supplier,
    price: "",
    priceValidity: new Date().toISOString().slice(0, 10),
    unitQuantity: "1",
    unitPrice: "",
  };
}

export default function NewSupplyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const suppliesQuery = useQuery({
    queryKey: ["supplies", "for-new-supply-id"],
    queryFn: async () => {
      try {
        const response = await getAllSupplies();
        return response.data ?? [];
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }

        throw error;
      }
    },
  });

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "for-pricing"],
    queryFn: getAllSuppliers,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("");
  const [attachments, setAttachments] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([defaultSpecification()]);
  const [supplierPricing, setSupplierPricing] = useState<SupplierPricingForm[]>([defaultSupplierPricing()]);

  useEffect(() => {
    const firstSupplierId = suppliersQuery.data?.data?.[0]?._id;
    if (!firstSupplierId) {
      return;
    }

    setSupplierPricing((prev) =>
      prev.map((pricing, index) => (index === 0 && !pricing.supplier ? { ...pricing, supplier: firstSupplierId } : pricing)),
    );
  }, [suppliersQuery.data]);

  const supplyID = useMemo(() => {
    const ids = suppliesQuery.data
      ?.map((supply) => {
        const match = supply.supplyID.match(/^SPL-(\d+)$/);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => Number.isFinite(value)) ?? [];

    const nextId = (ids.length ? Math.max(...ids) : 2000) + 1;
    return `SPL-${nextId}`;
  }, [suppliesQuery.data]);

  const createMutation = useMutation({
    mutationFn: (normalizedSupplierPricing: SupplierPricing[]) =>
      createSupply({
        supplyID,
        name,
        description,
        categories: splitValues(categories),
        unitMeasure,
        attachments: splitValues(attachments),
        specifications: specifications.filter((spec) => spec.specProperty.trim() && `${spec.specValue}`.trim()),
        supplierPricing: normalizedSupplierPricing,
      }),
    onSuccess: (response) => {
      toast.success("Supply created successfully");
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      router.push(`/supplies/${response.data.supplyID}`);
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create supply");
      }
    },
  });

  const updateSpecification = (index: number, value: Partial<Specification>) => {
    setSpecifications((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...value } : item)));
  };

  const updateSupplierPricingRow = (index: number, value: Partial<SupplierPricingForm>) => {
    setSupplierPricing((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...value } : item)));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (splitValues(categories).length === 0) {
      toast.error("Provide at least one category");
      return;
    }

    if (supplierPricing.some((item) => !item.supplier)) {
      toast.error("All supplier pricing rows require a supplier");
      return;
    }

    const normalizedSupplierPricing = supplierPricing.map((item) => {
      const unitQuantity = Number.parseFloat(item.unitQuantity);
      const unitPrice = Number.parseFloat(item.unitPrice);
      const price = Number.parseFloat(item.price);

      return {
        supplier: item.supplier,
        priceValidity: item.priceValidity,
        unitQuantity,
        unitPrice,
        price,
      };
    });

    if (normalizedSupplierPricing.some((item) => !Number.isFinite(item.unitQuantity) || !Number.isFinite(item.unitPrice) || !Number.isFinite(item.price))) {
      toast.error("Complete supplier pricing values before submitting");
      return;
    }

    if (normalizedSupplierPricing.some((item) => item.price !== item.unitPrice * item.unitQuantity)) {
      toast.error("Pricing must satisfy price = unitPrice × unitQuantity");
      return;
    }

    if (specifications.filter((item) => item.specProperty.trim()).length === 0) {
      toast.error("Provide at least one specification");
      return;
    }

    createMutation.mutate(normalizedSupplierPricing);
  };

  const supplierOptions = suppliersQuery.data?.data ?? [];

  return (
    <PageLayout
      title="Create Supply"
      description="Add a new supply item with specifications and supplier pricing details."
      action={
        <Link href="/supplies" className="text-sm text-neutral-700 underline underline-offset-2">
          Back to supplies
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Supply ID</label>
            <input
              value={supplyID}
              disabled
              readOnly
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">Automatically generated and cannot be edited.</p>
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
              placeholder="Electrical, Wiring"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Unit Measure</label>
            <input
              value={unitMeasure}
              onChange={(event) => setUnitMeasure(event.target.value)}
              required
              placeholder="roll"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Attachment Links (comma-separated)</label>
            <input
              value={attachments}
              onChange={(event) => setAttachments(event.target.value)}
              placeholder="https://example.com/spec-sheet.pdf"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Specifications</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSpecifications((prev) => [...prev, defaultSpecification()])}
            >
              Add Specification
            </Button>
          </div>

          {specifications.map((specification, index) => (
            <div key={`spec-${index}`} className="grid gap-2 rounded-md border border-neutral-200 p-3 md:grid-cols-2">
              <input
                value={specification.specProperty}
                onChange={(event) => updateSpecification(index, { specProperty: event.target.value })}
                placeholder="Property"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={`${specification.specValue ?? ""}`}
                  onChange={(event) => updateSpecification(index, { specValue: event.target.value })}
                  placeholder="Value"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
                {specifications.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSpecifications((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Supplier Pricing</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setSupplierPricing((prev) => [...prev, defaultSupplierPricing(supplierOptions[0]?._id ?? "")])
              }
              disabled={supplierOptions.length === 0}
            >
              Add Supplier Pricing
            </Button>
          </div>

          {supplierOptions.length === 0 ? (
            <EmptyState
              title="No suppliers available"
              description="Create at least one supplier first before adding supply pricing."
            />
          ) : (
            supplierPricing.map((pricing, index) => (
              <div key={`pricing-${index}`} className="grid gap-2 rounded-md border border-neutral-200 p-3 md:grid-cols-5">
                <select
                  value={pricing.supplier}
                  onChange={(event) => updateSupplierPricingRow(index, { supplier: event.target.value })}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                >
                  {supplierOptions.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierID} — {supplier.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.unitQuantity}
                  onChange={(event) => updateSupplierPricingRow(index, { unitQuantity: event.target.value })}
                  placeholder="Quantity"
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.unitPrice}
                  onChange={(event) => updateSupplierPricingRow(index, { unitPrice: event.target.value })}
                  placeholder="Unit Price"
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing.price}
                  onChange={(event) => updateSupplierPricingRow(index, { price: event.target.value })}
                  placeholder="Total Price"
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={pricing.priceValidity.slice(0, 10)}
                    onChange={(event) => updateSupplierPricingRow(index, { priceValidity: event.target.value })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                  {supplierPricing.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSupplierPricing((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </section>

        <Button type="submit" isLoading={createMutation.isPending}>
          Create Supply
        </Button>
      </form>
    </PageLayout>
  );
}
