import { createHouseholdAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function HouseholdsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);
  const households = await prisma.household.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Services Menagers" title="Gestion des Foyers" description="Gestion des familles/foyers clients et de leurs besoins en services." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Nouveau Foyer" description="Creation d'un dossier foyer avec responsable, telephone, adresse et service souhaite.">
          <form action={createHouseholdAction} className="grid gap-4">
            <Field label="Nom foyer" name="name" required />
            <Field label="Responsable" name="managerName" required />
            <Field label="Telephone" name="phone" required />
            <Field label="Adresse" name="address" />
            <Field label="Service demande" name="requestedService" />
            <SubmitButton label="Ajouter le foyer" />
          </form>
        </Panel>

        <Panel title="Liste des Foyers" description="Vue d'ensemble des foyers disponibles pour les affectations.">
          <DataTable
            headers={["Nom Foyer", "Responsable", "Telephone", "Adresse", "Services"]}
            rows={households.map((household) => [
              <div key="household">
                <p className="font-semibold">{household.name}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{household.code}</p>
              </div>,
              household.managerName,
              household.phone,
              household.address || "-",
              household.requestedService || "-",
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
