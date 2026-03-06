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
import { HttpError } from "@/lib/api/client";
import { getAllSupplies } from "@/lib/api/supplies";
import {
  deleteSupplier,
  getSupplierById,
  linkSupplyToSupplier,
  unlinkSupplyFromSupplier,
  updateSupplier,
  updateSupplierStatus,
} from "@/lib/api/suppliers";
import { ContactPerson, SupplierStatus } from "@/lib/types/supplier";

function splitValues(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toCsv(value?: string[]) {
  return (value ?? []).join(", ");
}

function defaultContactPerson(): ContactPerson {
  return {
    name: "",
    contactNumber: "",
    email: "",
    position: "",
  };
}

export default function SupplierDetailPage() {
  const params = useParams<{ supplierID: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const supplierID = params.supplierID;

  const supplierQuery = useQuery({
    queryKey: ["supplier", supplierID],
    queryFn: () => getSupplierById(supplierID),
    enabled: Boolean(supplierID),
  });

  const suppliesQuery = useQuery({
    queryKey: ["supplies", "for-supplier-link"],
    queryFn: getAllSupplies,
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [primaryTag, setPrimaryTag] = useState("");
  const [contactNumbers, setContactNumbers] = useState("");
  const [emails, setEmails] = useState("");
  const [tags, setTags] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([defaultContactPerson()]);
  const [selectedSupplyID, setSelectedSupplyID] = useState("");

  useEffect(() => {
    const supplier = supplierQuery.data?.data;
    if (!supplier) {
      return;
    }

    setName(supplier.name);
    setAddress(supplier.address);
    setPrimaryTag(supplier.primaryTag);
    setContactNumbers(toCsv(supplier.contactNumbers));
    setEmails(toCsv(supplier.emails));
    setTags(toCsv(supplier.tags));
    setDocumentation(toCsv(supplier.documentation));
    setContactPersons(supplier.contactPersons?.length ? supplier.contactPersons : [defaultContactPerson()]);
  }, [supplierQuery.data]);

  const supplier = supplierQuery.data?.data;

  const availableSupplies = useMemo(() => {
    const allSupplies = suppliesQuery.data?.data ?? [];
    const linked = new Set(supplier?.supplies ?? []);

    return allSupplies.filter((supply) => !linked.has(supply.supplyID));
  }, [suppliesQuery.data, supplier?.supplies]);

  useEffect(() => {
    if (!selectedSupplyID && availableSupplies.length > 0) {
      setSelectedSupplyID(availableSupplies[0].supplyID);
    }

    if (availableSupplies.length === 0) {
      setSelectedSupplyID("");
    }
  }, [availableSupplies, selectedSupplyID]);

  const invalidateSupplierQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["supplier", supplierID] });
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSupplier(supplierID, {
        name,
        address,
        primaryTag,
        contactNumbers: splitValues(contactNumbers),
        emails: splitValues(emails),
        tags: splitValues(tags),
        documentation: splitValues(documentation),
        contactPersons: contactPersons.filter((person) => person.name.trim() && person.contactNumber.trim()),
      }),
    onSuccess: () => {
      toast.success("Supplier updated");
      invalidateSupplierQueries();
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update supplier");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: SupplierStatus) => updateSupplierStatus(supplierID, status),
    onSuccess: () => {
      toast.success("Supplier status updated");
      invalidateSupplierQueries();
    },
    onError: () => {
      toast.error("Failed to update supplier status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSupplier(supplierID),
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      router.push("/suppliers");
    },
    onError: () => {
      toast.error("Failed to delete supplier");
    },
  });

  const linkMutation = useMutation({
    mutationFn: (supplyID: string) => linkSupplyToSupplier(supplierID, supplyID),
    onSuccess: () => {
      toast.success("Supply linked to supplier");
      invalidateSupplierQueries();
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to link supply");
      }
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (supplyID: string) => unlinkSupplyFromSupplier(supplierID, supplyID),
    onSuccess: () => {
      toast.success("Supply unlinked from supplier");
      invalidateSupplierQueries();
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to unlink supply");
      }
    },
  });

  const updateContactPerson = (index: number, value: Partial<ContactPerson>) => {
    setContactPersons((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...value } : item)));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (splitValues(contactNumbers).length === 0 || splitValues(tags).length === 0) {
      toast.error("Contact numbers and tags require at least one value");
      return;
    }

    updateMutation.mutate();
  };

  if (supplierQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (supplierQuery.isError || !supplier) {
    return (
      <PageLayout title="Supplier Details" description="Unable to load supplier information.">
        <EmptyState title="Supplier not found" description="The requested supplier could not be loaded." />
      </PageLayout>
    );
  }

  const currentStatus = supplier.status ?? "Active";
  const nextStatus: SupplierStatus = currentStatus === "Active" ? "Inactive" : "Active";

  return (
    <PageLayout
      title={`Supplier: ${supplier.supplierID}`}
      description="Update supplier details and maintain linked supply references."
      action={
        <Link href="/suppliers" className="text-sm text-neutral-700 underline underline-offset-2">
          Back to suppliers
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
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
            <label className="mb-1 block text-sm font-medium text-neutral-700">Supplier ID</label>
            <input
              value={supplier.supplierID}
              disabled
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Company Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Address</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Primary Tag</label>
            <input
              value={primaryTag}
              onChange={(event) => setPrimaryTag(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Contact Numbers (comma-separated)</label>
            <input
              value={contactNumbers}
              onChange={(event) => setContactNumbers(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Emails (comma-separated)</label>
            <input
              value={emails}
              onChange={(event) => setEmails(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Documentation Links (comma-separated)</label>
            <input
              value={documentation}
              onChange={(event) => setDocumentation(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Contact Persons</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setContactPersons((prev) => [...prev, defaultContactPerson()])}
            >
              Add Contact Person
            </Button>
          </div>

          {contactPersons.map((person, index) => (
            <div key={`contact-person-${index}`} className="grid gap-3 rounded-md border border-neutral-200 p-3 md:grid-cols-2">
              <input
                value={person.name}
                onChange={(event) => updateContactPerson(index, { name: event.target.value })}
                placeholder="Name"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <input
                value={person.contactNumber}
                onChange={(event) => updateContactPerson(index, { contactNumber: event.target.value })}
                placeholder="Contact Number"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <input
                value={person.email ?? ""}
                onChange={(event) => updateContactPerson(index, { email: event.target.value })}
                placeholder="Email"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={person.position ?? ""}
                  onChange={(event) => updateContactPerson(index, { position: event.target.value })}
                  placeholder="Position"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
                {contactPersons.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setContactPersons((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-md border border-neutral-200 p-4">
          <h2 className="text-base font-semibold text-neutral-900">Linked Supplies</h2>

          {!supplier.supplies?.length ? (
            <EmptyState
              title="No linked supplies"
              description="Select a supply below to start linking supplier and supply records."
            />
          ) : (
            <ul className="space-y-2">
              {supplier.supplies.map((linkedSupplyID) => (
                <li key={linkedSupplyID} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
                  <Link href={`/supplies/${linkedSupplyID}`} className="text-sm text-neutral-900 underline underline-offset-2">
                    {linkedSupplyID}
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    isLoading={unlinkMutation.isPending}
                    onClick={() => unlinkMutation.mutate(linkedSupplyID)}
                  >
                    Unlink
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSupplyID}
              onChange={(event) => setSelectedSupplyID(event.target.value)}
              className="min-w-[220px] rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              disabled={!availableSupplies.length}
            >
              {availableSupplies.length === 0 ? (
                <option value="">No available supplies to link</option>
              ) : (
                availableSupplies.map((supply) => (
                  <option key={supply.supplyID} value={supply.supplyID}>
                    {supply.supplyID} — {supply.name}
                  </option>
                ))
              )}
            </select>

            <Button
              type="button"
              variant="secondary"
              isLoading={linkMutation.isPending}
              disabled={!selectedSupplyID}
              onClick={() => linkMutation.mutate(selectedSupplyID)}
            >
              Link Supply
            </Button>
          </div>
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
            Delete Supplier
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
