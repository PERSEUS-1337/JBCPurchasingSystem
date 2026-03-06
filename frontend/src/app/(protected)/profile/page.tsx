"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/lib/api/auth";
import { HttpError } from "@/lib/api/client";

export default function ProfilePage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileRows = useMemo(
    () => [
      { label: "Full Name", value: user?.fullname ?? "-" },
      { label: "Email", value: user?.email ?? "-" },
      { label: "Position", value: user?.position ?? "-" },
      { label: "Department", value: user?.department ?? "-" },
    ],
    [user],
  );

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      if (error instanceof HttpError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to change password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="My Profile"
      description="View your profile details and update your account password."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Profile Information</h2>
          <dl className="space-y-3">
            {profileRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-2">
                <dt className="text-sm text-neutral-500">{row.label}</dt>
                <dd className="text-sm font-medium text-neutral-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                minLength={8}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-neutral-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Must include letters, numbers, and special characters.
              </p>
            </div>

            <Button type="submit" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}
