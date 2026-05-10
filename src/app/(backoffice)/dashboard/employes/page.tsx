import { createEmployeeAction } from "@/app/actions";
import { EmployeeActions } from "./ClientModals";
import { DataTable, Field, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { serializeData } from "@/lib/utils";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function EmployeesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);
  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" }, include: { availability: true } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Services Menagers" title="Gestion des Employes" description="Base des employes/prestataires disponibles pour les foyers et missions." />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Nouvel Employe" description="Enregistrement d'un employe avec competence et disponibilite.">
          <form action={createEmployeeAction} className="grid gap-4">
            <Field label="Nom complet" name="fullName" required />
            <Field label="Telephone" name="phone" required />
            <Field label="Adresse" name="address" />
            <Field label="Competence" name="competency" required />
            <Field label="Disponibilite" name="availability" />
            <SubmitButton label="Ajouter l'employe" />
          </form>
        </Panel>

        <Panel title="Liste des Employes" description="Recherche et suivi des competences et statuts.">
          <DataTable
            headers={["Employe", "Telephone", "Adresse", "Competences", "Disponibilite", "Statut", "Actions"]}
            rows={employees.map((employee) => [
              <div key="employee">
                <p className="font-semibold">{employee.fullName}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{employee.employeeNo}</p>
              </div>,
              employee.phone,
              employee.address || "-",
              employee.competency,
              employee.availability?.label || "-",
              employee.status,
              <EmployeeActions key="actions" employee={serializeData(employee)} />,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
