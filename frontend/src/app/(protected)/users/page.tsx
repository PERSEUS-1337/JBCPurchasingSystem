"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Table } from "@/components/ui/Table";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers } from "@/lib/api/users";
import { UserAdminView } from "@/lib/types/user";

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isSuperAdmin,
  });

  if (!isSuperAdmin) {
    return (
      <PageLayout title="Users" description="Restricted to Super Administrator accounts.">
        <EmptyState
          title="Access denied"
          description="You do not have permission to view this page."
        />
      </PageLayout>
    );
  }

  if (usersQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <PageLayout title="Users" description="Unable to load users at the moment.">
        <EmptyState title="Failed to load users" description="Please try refreshing this page." />
      </PageLayout>
    );
  }

  const users = (usersQuery.data?.data ?? []) as UserAdminView[];

  return (
    <PageLayout title="Users" description="Manage user records and access information.">
      <Table
        columns={[
          {
            key: "userID",
            header: "User ID",
            render: (row) => (
              <Link href={`/users/${row.userID}`} className="text-neutral-900 underline underline-offset-2">
                {row.userID}
              </Link>
            ),
          },
          { key: "fullname", header: "Name", render: (row) => row.fullname },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "role", header: "Role", render: (row) => row.role },
          { key: "department", header: "Department", render: (row) => row.department },
          { key: "status", header: "Status", render: (row) => row.status },
        ]}
        data={users}
        rowKey={(row) => row.userID}
        emptyContent={<EmptyState title="No users found" description="No user records available yet." />}
      />
    </PageLayout>
  );
}
