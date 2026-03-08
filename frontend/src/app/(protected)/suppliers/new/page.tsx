"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { createSupplier, getAllSuppliers } from "@/lib/api/suppliers";
import { HttpError } from "@/lib/api/client";
import { ContactPerson } from "@/lib/types/supplier";

function splitValues(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function defaultContactPerson(): ContactPerson {
  return {
    name: "",
    contactNumber: "",
    email: "",
    position: "",
  };
}

export default function NewSupplierPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "for-new-supplier-id"],
    queryFn: async () => {
      try {
        const response = await getAllSuppliers();
        return response.data ?? [];
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }

        throw error;
      }
    },
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [primaryTag, setPrimaryTag] = useState("");
  const [contactNumbers, setContactNumbers] = useState("");
  const [emails, setEmails] = useState("");
  const [tags, setTags] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([defaultContactPerson()]);

  const supplierID = useMemo(() => {
    const ids = suppliersQuery.data
      ?.map((supplier) => {
        const match = supplier.supplierID.match(/^SUP-(\d+)$/);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => Number.isFinite(value)) ?? [];

    const nextId = (ids.length ? Math.max(...ids) : 1000) + 1;
    return `SUP-${nextId}`;
  }, [suppliersQuery.data]);

  const createMutation = useMutation({
    mutationFn: () =>
      createSupplier({
        supplierID,
        name,
        address,
        primaryTag,
        contactNumbers: splitValues(contactNumbers),
        emails: splitValues(emails),
        tags: splitValues(tags),
        documentation: splitValues(documentation),
        contactPersons: contactPersons.filter((person) => person.name.trim() && person.contactNumber.trim()),
      }),
    onSuccess: (response) => {
      toast.success("Supplier created successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      router.push(`/suppliers/${response.data.supplierID}`);
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create supplier");
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

    createMutation.mutate();
  };

  return (
    <PageLayout
      title="Create Supplier"
      description="Add a new supplier with core company details and contact references."
      action={
        <Link href="/suppliers" className="text-sm text-neutral-700 underline underline-offset-2">
          Back to suppliers
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Supplier ID</label>
            <input
              value={supplierID}
              disabled
              readOnly
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">Automatically generated and cannot be edited.</p>
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
              placeholder="Electrical, Wiring"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Contact Numbers (comma-separated)</label>
            <input
              value={contactNumbers}
              onChange={(event) => setContactNumbers(event.target.value)}
              required
              placeholder="+639171234567, +639181234567"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Emails (comma-separated)</label>
            <input
              value={emails}
              onChange={(event) => setEmails(event.target.value)}
              placeholder="orders@supplier.com"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Documentation Links (comma-separated)</label>
            <input
              value={documentation}
              onChange={(event) => setDocumentation(event.target.value)}
              placeholder="https://example.com/doc1.pdf"
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

        <Button type="submit" isLoading={createMutation.isPending}>
          Create Supplier
        </Button>
      </form>
    </PageLayout>
  );
}
