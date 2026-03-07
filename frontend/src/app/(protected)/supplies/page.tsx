"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getAllSupplies, searchSupplies, updateSupplyStatus } from "@/lib/api/supplies";
import { Supply, SupplyStatus } from "@/lib/types/supply";

function getStatusTone(status?: SupplyStatus) {
  return status === "Inactive" ? "muted" : "success";
}

export default function SuppliesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(handler);
  }, [searchInput]);

  const suppliesQuery = useQuery({
    queryKey: ["supplies", searchTerm],
    queryFn: () => (searchTerm ? searchSupplies(searchTerm) : getAllSupplies()),
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
          placeholder="Search supplies by name"
          className="w-full max-w-xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
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
      </div>

      <Table
        columns={[
          {
            key: "supplyID",
            header: "Supply ID",
            render: (row) => (
              <Link href={`/supplies/${row.supplyID}`} className="text-neutral-900 underline underline-offset-2">
                {row.supplyID}
              </Link>
            ),
          },
          { key: "name", header: "Name", render: (row) => row.name },
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
        data={supplies}
        rowKey={(row) => row.supplyID}
        emptyContent={
          <EmptyState
            title="No supplies found"
            description="Create your first supply record to populate master data."
          />
        }
      />
    </PageLayout>
  );
}
