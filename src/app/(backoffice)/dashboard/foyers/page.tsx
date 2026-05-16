import { HouseholdForm } from "./HouseholdForm";
import { DataTable, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function HouseholdsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);
  const households = await prisma.household.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      {/* <PageHeader eyebrow="Services Menagers" title="Gestion des Foyers" description="Gestion des familles/foyers clients et de leurs besoins en services." /> */}
      <div className="grid gap-6 xl:grid-cols-1">
        <HouseholdForm />

        <Panel title="Liste des Foyers" description="Vue d'ensemble des foyers disponibles pour les affectations.">
          <DataTable
            headers={["Nom Foyer", "Telephone", "Adresse", "Email", "Profession"]}
            rows={households.map((household) => [
              <div key="household">
                <p className="font-semibold">{household.firstName} {household.lastName}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{household.quartier || "-"}</p>
              </div>,
              household.primaryPhone,
              household.address || "-",
              household.email || "-",
              household.profession || "-",
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
