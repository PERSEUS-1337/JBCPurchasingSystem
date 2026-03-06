"use client";

import { FormEvent, useMemo, useState } from "react";
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
import { getAllSuppliers, searchSuppliers, updateSupplierStatus } from "@/lib/api/suppliers";
import { Supplier, SupplierStatus } from "@/lib/types/supplier";

function getStatusTone(status?: SupplierStatus) {
  return status === "Inactive" ? "muted" : "success";
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", searchTerm],
    queryFn: () => (searchTerm ? searchSuppliers(searchTerm) : getAllSuppliers()),
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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const suppliers = useMemo(() => {
    if (!suppliersQuery.data?.data) {
      return [] as Supplier[];
    }

    return suppliersQuery.data.data;
  }, [suppliersQuery.data]);

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
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by supplier name, tag, email, or contact"
          className="w-full max-w-xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {searchTerm ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSearchTerm("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

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
              render: (row) => (
                <Link href={`/suppliers/${row.supplierID}`} className="text-neutral-900 underline underline-offset-2">
                  {row.supplierID}
                </Link>
              ),
            },
            { key: "name", header: "Name", render: (row) => row.name },
            { key: "primaryTag", header: "Primary Tag", render: (row) => row.primaryTag },
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
          data={suppliers}
          rowKey={(row) => row.supplierID}
          emptyContent={
            <EmptyState
              title="No suppliers yet"
              description="Create your first supplier to start building master data."
            />
          }
        />
      )}
    </PageLayout>
  );
}
