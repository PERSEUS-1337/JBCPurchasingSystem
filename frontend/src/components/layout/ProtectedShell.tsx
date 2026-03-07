"use client";

import { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type ProtectedShellProps = {
  children: ReactNode;
};

export function ProtectedShell({ children }: ProtectedShellProps) {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 md:flex overflow-x-hidden">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 min-w-0 overflow-x-hidden px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
