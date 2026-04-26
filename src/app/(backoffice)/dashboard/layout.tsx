import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  return (
    <DashboardShell role={session.role} userName={session.name} logoutAction={logoutAction}>
      {children}
    </DashboardShell>
  );
}
