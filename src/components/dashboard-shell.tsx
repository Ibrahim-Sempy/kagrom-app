"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Role } from "@prisma/client";
import { Brand } from "@/components/brand";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  role: Role;
  userName: string;
  logoutAction: (formData: FormData) => void | Promise<void>;
};

export function DashboardShell({ children, role, userName, logoutAction }: DashboardShellProps) {
  const pathname = usePathname();
  const items = navigationItems.filter((item) => item.roles.includes(role));
  const sections = Array.from(new Set(items.map((item) => item.section).filter(Boolean)));

  return (
    <div className="min-h-screen bg-[#eef3fb]">
      <div className="grid min-h-screen w-full lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="bg-[#162032] px-8 py-10 text-white">
          <Brand />

          <nav className="mt-10 space-y-6">
            {items
              .filter((item) => item.section === null)
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 rounded-3xl px-5 py-4 text-sm font-medium transition",
                      active
                        ? "bg-[linear-gradient(135deg,#6555ff,#4f46e5)] text-white shadow-[0_14px_30px_rgba(99,91,255,0.35)]"
                        : "text-[#9cadc7] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

            {sections.map((section) => (
              <div key={section} className="border-t border-white/10 pt-6">
                <p className="px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6b87]">{section}</p>
                <div className="mt-4 space-y-2">
                  {items
                    .filter((item) => item.section === section)
                    .map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-4 rounded-3xl px-5 py-4 text-sm font-medium transition",
                            active
                              ? "bg-[linear-gradient(135deg,#6555ff,#4f46e5)] text-white shadow-[0_14px_30px_rgba(99,91,255,0.35)]"
                              : "text-[#9cadc7] hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Se deconnecter
            </button>
          </form>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#dbe4f1] bg-[#f8fbff]/95 px-6 py-6 backdrop-blur">
            <div />
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 rounded-2xl border border-[#d9e4f2] bg-white px-4 py-3 md:flex md:w-[380px]">
                <Search className="h-5 w-5 text-[#94a3b8]" />
                <input
                  aria-label="Recherche globale"
                  placeholder="Rechercher..."
                  className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#94a3b8]"
                />
              </div>
              <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#475569] shadow-[0_12px_24px_rgba(148,163,184,0.12)]">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-3 shadow-[0_12px_24px_rgba(148,163,184,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4f46e5] text-lg font-bold text-white">
                  {userName
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#0f172a]">{userName}</p>
                  <p className="text-sm text-[#64748b]">{role}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
