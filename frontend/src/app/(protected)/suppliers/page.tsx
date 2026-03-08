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
import { getAllSuppliers, updateSupplierStatus } from "@/lib/api/suppliers";
import { Supplier, SupplierStatus } from "@/lib/types/supplier";

function getStatusTone(status?: SupplierStatus) {
  return status === "Inactive" ? "muted" : "success";
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: getAllSuppliers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ supplierID, status }: { supplierID: string; status: SupplierStatus }) =>
      updateSupplierStatus(supplierID, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier status updated");
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update status");
      }
    },
  });

  const suppliers = useMemo(() => {
    if (!suppliersQuery.data?.data) {
      return [] as Supplier[];
    }

    return suppliersQuery.data.data;
  }, [suppliersQuery.data]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const supplier of suppliers) {
      for (const tag of supplier.tags ?? []) {
        if (tag.trim()) {
          tagSet.add(tag.trim());
        }
      }
    }

    return Array.from(tagSet).sort((left, right) => left.localeCompare(right));
  }, [suppliers]);

  const matchesSupplierSearch = (supplier: Supplier, normalizedSearch: string) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      supplier.supplierID,
      supplier.name,
      supplier.address,
      supplier.primaryTag,
      ...(supplier.tags ?? []),
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  };

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch = matchesSupplierSearch(supplier, normalizedSearch);

      const matchesSelectedTags =
        selectedTags.length === 0 || selectedTags.every((tag) => (supplier.tags ?? []).includes(tag));

      return matchesSearch && matchesSelectedTags;
    });
  }, [searchInput, selectedTags, suppliers]);

  const availableTagSelectionMap = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();
    const map = new Map<string, boolean>();

    for (const tag of availableTags) {
      if (selectedTags.includes(tag)) {
        map.set(tag, true);
        continue;
      }

      const hypotheticalTags = [...selectedTags, tag];
      const hasResults = suppliers.some((supplier) => {
        const matchesSearch = matchesSupplierSearch(supplier, normalizedSearch);
        const matchesTags = hypotheticalTags.every((item) => (supplier.tags ?? []).includes(item));
        return matchesSearch && matchesTags;
      });

      map.set(tag, hasResults);
    }

    return map;
  }, [availableTags, searchInput, selectedTags, suppliers]);

  const toggleTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag],
    );
  };

  const isNotFound = suppliersQuery.error instanceof HttpError && suppliersQuery.error.status === 404;

  if (suppliersQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (suppliersQuery.isError && !isNotFound) {
    return (
      <PageLayout title="Suppliers" description="Unable to load supplier records.">
        <EmptyState title="Failed to load suppliers" description="Please try again in a moment." />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Suppliers"
      description="Manage supplier master data, search records, and update status."
      action={
        <Link href="/suppliers/new">
          <Button>Create Supplier</Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by supplier name, ID, tags, or address"
          className="w-full max-w-xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700">
            Filter Tags {selectedTags.length > 0 ? `(${selectedTags.length})` : ""}
          </summary>
          <div className="absolute z-20 mt-2 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Available Tags</p>
            <div className="max-h-56 space-y-2 overflow-auto">
              {availableTags.length === 0 ? (
                <p className="text-xs text-neutral-500">No tags available.</p>
              ) : (
                availableTags.map((tag) => (
                  <label key={tag} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      disabled={!availableTagSelectionMap.get(tag)}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    <span className={!availableTagSelectionMap.get(tag) ? "text-neutral-400" : ""}>{tag}</span>
                  </label>
                ))
              )}
            </div>
            {selectedTags.length > 0 ? (
              <button
                type="button"
                className="mt-3 text-xs text-neutral-700 underline underline-offset-2"
                onClick={() => setSelectedTags([])}
              >
                Clear tag filters
              </button>
            ) : null}
          </div>
        </details>
        {searchInput || selectedTags.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSelectedTags([]);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {isNotFound ? (
        <EmptyState
          title="No suppliers found"
          description="Try a different search keyword or create a new supplier record."
        />
      ) : (
        <Table
          columns={[
            {
              key: "supplierID",
              header: "Supplier ID",
              sortable: true,
              sortValue: (row) => row.supplierID,
              render: (row) => (
                <Link href={`/suppliers/${row.supplierID}`} className="text-neutral-900 underline underline-offset-2">
                  {row.supplierID}
                </Link>
              ),
            },
            { key: "name", header: "Name", sortable: true, sortValue: (row) => row.name, render: (row) => row.name },
            { key: "primaryTag", header: "Primary Tag", render: (row) => row.primaryTag },
            {
              key: "tags",
              header: "Tags",
              cellClassName: "whitespace-normal",
              render: (row) => (
                <div className="flex max-w-[260px] flex-wrap gap-1">
                  {(row.tags ?? []).map((tag) => (
                    <span
                      key={`${row.supplierID}-${tag}`}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              key: "address",
              header: "Address",
              cellClassName: "whitespace-normal",
              render: (row) => <span className="block max-w-[260px] break-words">{row.address}</span>,
            },
            {
              key: "contactNumbers",
              header: "Contact Numbers",
              cellClassName: "whitespace-normal",
              render: (row) => (
                <div className="max-w-[220px] space-y-1">
                  {(row.contactNumbers ?? []).map((contact) => (
                    <p key={`${row.supplierID}-${contact}`} className="break-words text-xs text-neutral-700">
                      {contact}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              key: "emails",
              header: "Emails",
              cellClassName: "whitespace-normal",
              render: (row) => (
                <div className="max-w-[240px] space-y-1">
                  {(row.emails ?? []).length === 0 ? (
                    <p className="text-xs text-neutral-500">-</p>
                  ) : (
                    (row.emails ?? []).map((email) => (
                      <p key={`${row.supplierID}-${email}`} className="break-words text-xs text-neutral-700">
                        {email}
                      </p>
                    ))
                  )}
                </div>
              ),
            },
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
                const nextStatus: SupplierStatus = currentStatus === "Active" ? "Inactive" : "Active";

                return (
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ supplierID: row.supplierID, status: nextStatus })}
                  >
                    Set {nextStatus}
                  </Button>
                );
              },
            },
          ]}
          data={filteredSuppliers}
          rowKey={(row) => row.supplierID}
          emptyContent={
            <EmptyState
              title="No suppliers found"
              description="Try different search text or filter selections."
            />
          }
        />
      )}
    </PageLayout>
  );
}
