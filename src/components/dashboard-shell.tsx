"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Search, Menu } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const items = navigationItems.filter((item) => item.roles.includes(role));
  const sections = Array.from(new Set(items.map((item) => item.section).filter(Boolean)));
  
  const activeItem = items.find((item) => item.href === pathname);
  const pageTitle = activeItem ? activeItem.label : "Tableau de bord";
 
  return (
    <div className="min-h-screen bg-[#eef3fb]">
      <div className={cn("grid min-h-screen w-full transition-[grid-template-columns] duration-300", isCollapsed ? "lg:grid-cols-[100px_minmax(0,1fr)]" : "lg:grid-cols-[310px_minmax(0,1fr)]")}>
        <aside className="bg-[#162032] text-white flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between px-8 py-10">
            {!isCollapsed && <Brand />}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className={cn("text-white/70 hover:text-white transition", isCollapsed && "mx-auto")}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

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
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 text-sm font-medium transition rounded-md",
                      active
                        ? "bg-[color:var(--brand-green)] text-white shadow-[0_14px_30px_rgba(56,91,42,0.35)]"
                        : "text-[#9cadc7] hover:bg-[color:var(--brand-green)] hover:text-white",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}

            {sections.map((section) => (
              <div key={section} className="border-t border-white/10 pt-6">
                {!isCollapsed && <p className="px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6b87]">{section}</p>}
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
                          title={isCollapsed ? item.label : undefined}
                          className={cn(
                            "flex items-center gap-4 px-5 py-4 text-sm font-medium transition rounded-md",
                            active
                              ? "bg-[color:var(--brand-green)] text-white shadow-[0_14px_30px_rgba(56,91,42,0.35)]"
                              : "text-[#9cadc7] hover:bg-[color:var(--brand-green)] hover:text-white",
                            isCollapsed && "justify-center px-0"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          <form action={logoutAction} className="mt-auto mb-8 px-8">
            <button
              type="submit"
              title={isCollapsed ? "Se déconnecter" : undefined}
              className={cn(
                "flex w-full items-center justify-center gap-2 border border-white/10 bg-white/5 py-4 text-sm font-semibold text-white transition hover:bg-[#385b2a] rounded-md",
                isCollapsed ? "px-0" : "px-5"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Se déconnecter</span>}
            </button>
          </form>
        </aside>

        <div className="min-w-0 flex flex-col h-screen overflow-y-auto">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#dbe4f1] bg-[#f8fbff]/95 px-6 py-6 backdrop-blur">
            <div>
              <h1 className="text-xl font-bold text-[color:var(--foreground)]">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 border border-[#d9e4f2] bg-white px-4 py-3 md:flex md:w-[380px] rounded-md">
                <Search className="h-5 w-5 text-[#94a3b8]" />
                <input
                  aria-label="Recherche globale"
                  placeholder="Rechercher..."
                  className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#94a3b8]"
                />
              </div>
              <button className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-[#475569] shadow-[0_12px_24px_rgba(148,163,184,0.12)] rounded-md">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4 bg-white px-5 py-3 shadow-[0_12px_24px_rgba(148,163,184,0.12)] rounded-md shrink-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[color:var(--brand-green)] text-sm font-bold text-white rounded-md">
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
