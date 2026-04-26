import { createAssignmentAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function AssignmentsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const [employees, households, assignments] = await Promise.all([
    prisma.employee.findMany({ orderBy: { fullName: "asc" } }),
    prisma.household.findMany({ orderBy: { name: "asc" } }),
    prisma.assignment.findMany({
      orderBy: { startDate: "desc" },
      include: { employee: true, household: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Services Menagers" title="Affectations Employes & Foyers" description="Affectation d'un employe a un foyer et suivi de la periode de service." />
      <div className="space-y-6">
        <Panel title="Nouvelle Affectation" description="Selection de l'employe, du foyer, du service, date de debut et observations.">
          <form action={createAssignmentAction} className="grid gap-4 md:grid-cols-3">
            <SelectField label="Employe" name="employeeId" required options={employees.map((item) => ({ value: item.id, label: item.fullName }))} />
            <SelectField label="Foyer" name="householdId" required options={households.map((item) => ({ value: item.id, label: item.name }))} />
            <Field label="Service" name="serviceLabel" required />
            <Field label="Date Debut" name="startDate" type="date" required />
            <Field label="Date Fin" name="endDate" type="date" />
            <Field label="Notes" name="notes" />
            <div className="md:col-span-3">
              <SubmitButton label="Creer l'Affectation" />
            </div>
          </form>
        </Panel>

        <Panel title="Affectations Employes & Foyers" description="Historique des affectations en cours ou terminees.">
          <DataTable
            headers={["Employe", "Foyer", "Service", "Date Debut", "Date Fin", "Statut"]}
            rows={assignments.map((assignment) => [
              assignment.employee.fullName,
              assignment.household.name,
              assignment.serviceLabel,
              formatDate(assignment.startDate),
              assignment.endDate ? formatDate(assignment.endDate) : "-",
              assignment.status,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
