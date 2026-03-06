"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users", adminOnly: true },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/supplies", label: "Supplies" },
  { href: "/pr", label: "Purchase Requests" },
  { href: "/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();

  return (
    <aside className="w-full border-r border-neutral-200 bg-white px-4 py-5 md:w-64 md:min-h-screen">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">JBC System</p>
        <h2 className="text-lg font-semibold text-neutral-900">Purchasing</h2>
      </div>

      <nav className="space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isSuperAdmin)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
