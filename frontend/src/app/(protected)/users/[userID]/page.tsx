"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { deleteUser, getUserById, updateUser } from "@/lib/api/users";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ userID: string }>();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  const userID = params.userID;

  const userQuery = useQuery({
    queryKey: ["user", userID],
    queryFn: () => getUserById(userID),
    enabled: isSuperAdmin && Boolean(userID),
  });

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const data = userQuery.data?.data;
    if (!data) {
      return;
    }

    setFullname(data.fullname);
    setEmail(data.email);
    setPosition(data.position);
    setDepartment(data.department);
  }, [userQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateUser(userID, {
        fullname,
        email,
        position,
        department,
      }),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", userID] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(userID),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push("/users");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  if (!isSuperAdmin) {
    return (
      <PageLayout title="User Details" description="Restricted to Super Administrator accounts.">
        <EmptyState title="Access denied" description="You do not have permission to view this page." />
      </PageLayout>
    );
  }

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (userQuery.isError || !userQuery.data?.data) {
    return (
      <PageLayout title="User Details" description="Unable to load user information.">
        <EmptyState title="User not found" description="The requested user could not be loaded." />
      </PageLayout>
    );
  }

  const user = userQuery.data.data;

  return (
    <PageLayout
      title={`User: ${user.userID}`}
      description="Update basic user profile fields or remove the account."
      action={
        <Link href="/users" className="text-sm text-neutral-700 underline underline-offset-2">
          Back to users
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">User ID</label>
            <input
              value={user.userID}
              disabled
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Role</label>
            <input
              value={user.role}
              disabled
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
            <input
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Position</label>
            <input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Department</label>
            <input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

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
            Delete User
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
