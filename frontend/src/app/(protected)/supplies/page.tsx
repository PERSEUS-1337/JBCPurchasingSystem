"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Table } from "@/components/ui/Table";
import { HttpError } from "@/lib/api/client";
import { getAllSupplies, updateSupplyStatus } from "@/lib/api/supplies";
import { Supply, SupplyStatus } from "@/lib/types/supply";

function getStatusTone(status?: SupplyStatus) {
  return status === "Inactive" ? "muted" : "success";
}

export default function SuppliesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const suppliesQuery = useQuery({
    queryKey: ["supplies"],
    queryFn: getAllSupplies,
  });

  const statusMutation = useMutation({
    mutationFn: ({ supplyID, status }: { supplyID: string; status: SupplyStatus }) =>
      updateSupplyStatus(supplyID, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      toast.success("Supply status updated");
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update status");
      }
    },
  });

  const supplies = useMemo(() => {
    if (!suppliesQuery.data?.data) {
      return [] as Supply[];
    }

    return suppliesQuery.data.data;
  }, [suppliesQuery.data]);

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    for (const supply of supplies) {
      for (const category of supply.categories ?? []) {
        if (category.trim()) {
          categorySet.add(category.trim());
        }
      }
    }

    return Array.from(categorySet).sort((left, right) => left.localeCompare(right));
  }, [supplies]);

  const matchesSupplySearch = (supply: Supply, normalizedSearch: string) => {
    if (!normalizedSearch) {
      return true;
    }

    return [supply.supplyID, supply.name, ...(supply.categories ?? [])]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  };

  const filteredSupplies = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return supplies.filter((supply) => {
      const matchesSearch = matchesSupplySearch(supply, normalizedSearch);

      const matchesSelectedCategories =
        selectedCategories.length === 0 ||
        selectedCategories.every((category) => (supply.categories ?? []).includes(category));

      return matchesSearch && matchesSelectedCategories;
    });
  }, [searchInput, selectedCategories, supplies]);

  const availableCategorySelectionMap = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();
    const map = new Map<string, boolean>();

    for (const category of availableCategories) {
      if (selectedCategories.includes(category)) {
        map.set(category, true);
        continue;
      }

      const hypotheticalCategories = [...selectedCategories, category];
      const hasResults = supplies.some((supply) => {
        const matchesSearch = matchesSupplySearch(supply, normalizedSearch);
        const matchesCategories = hypotheticalCategories.every((item) =>
          (supply.categories ?? []).includes(item),
        );
        return matchesSearch && matchesCategories;
      });

      map.set(category, hasResults);
    }

    return map;
  }, [availableCategories, searchInput, selectedCategories, supplies]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category],
    );
  };

  if (suppliesQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (suppliesQuery.isError) {
    return (
      <PageLayout title="Supplies" description="Unable to load supply records.">
        <EmptyState title="Failed to load supplies" description="Please try again in a moment." />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Supplies"
      description="Manage supply master data, search records, and update status."
      action={
        <Link href="/supplies/new">
          <Button>Create Supply</Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search supplies by name, ID, or category"
          className="w-full max-w-xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700">
            Filter Categories {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ""}
          </summary>
          <div className="absolute z-20 mt-2 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Available Categories</p>
            <div className="max-h-56 space-y-2 overflow-auto">
              {availableCategories.length === 0 ? (
                <p className="text-xs text-neutral-500">No categories available.</p>
              ) : (
                availableCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      disabled={!availableCategorySelectionMap.get(category)}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    <span className={!availableCategorySelectionMap.get(category) ? "text-neutral-400" : ""}>{category}</span>
                  </label>
                ))
              )}
            </div>
            {selectedCategories.length > 0 ? (
              <button
                type="button"
                className="mt-3 text-xs text-neutral-700 underline underline-offset-2"
                onClick={() => setSelectedCategories([])}
              >
                Clear category filters
              </button>
            ) : null}
          </div>
        </details>
        {searchInput || selectedCategories.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSelectedCategories([]);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <Table
        columns={[
          {
            key: "supplyID",
            header: "Supply ID",
            sortable: true,
            sortValue: (row) => row.supplyID,
            render: (row) => (
              <Link href={`/supplies/${row.supplyID}`} className="text-neutral-900 underline underline-offset-2">
                {row.supplyID}
              </Link>
            ),
          },
          { key: "name", header: "Name", sortable: true, sortValue: (row) => row.name, render: (row) => row.name },
          {
            key: "categories",
            header: "Categories",
            cellClassName: "whitespace-normal",
            render: (row) => (
              <div className="flex max-w-[260px] flex-wrap gap-1">
                {(row.categories ?? []).map((category) => (
                  <span
                    key={`${row.supplyID}-${category}`}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 break-words"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ),
          },
          { key: "unitMeasure", header: "Unit", render: (row) => row.unitMeasure },
          {
            key: "status",
            header: "Status",
            render: (row) => <Badge tone={getStatusTone(row.status)}>{row.status ?? "Active"}</Badge>,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => {
              const currentStatus = row.status ?? "Active";
              const nextStatus: SupplyStatus = currentStatus === "Active" ? "Inactive" : "Active";

              return (
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ supplyID: row.supplyID, status: nextStatus })}
                >
                  Set {nextStatus}
                </Button>
              );
            },
          },
        ]}
        data={filteredSupplies}
        rowKey={(row) => row.supplyID}
        emptyContent={
          <EmptyState
            title="No supplies found"
            description="Try different search text or filter selections."
          />
        }
      />
    </PageLayout>
  );
}
