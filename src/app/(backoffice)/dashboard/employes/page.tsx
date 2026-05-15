import { EmployeeActions } from "./ClientModals";
import { EmployeeForm } from "./EmployeeForm";
import { DataTable, Panel } from "@/components/ui";
import { serializeData } from "@/lib/utils";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function EmployeesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const [employees, services, availabilities] = await Promise.all([
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: { availability: true, competencies: true, posteDemanded: true },
    }),
    prisma.service.findMany({ orderBy: { label: "asc" } }),
    prisma.availability.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-1">
        <EmployeeForm services={services} availabilities={availabilities} />

        <Panel title="Liste des Employes" description="Recherche et suivi des competences et statuts.">
          <DataTable
            headers={["Employe", "Telephone", "Adresse", "Competences", "Disponibilite", "Actions"]}
            rows={employees.map((employee) => [

              <div key="employee">
                <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{employee.primaryPhone}</p>
              </div>,
              employee.secondaryPhone || employee.primaryPhone,
              employee.address || "-",
              employee.competencies.map((c) => c.label).join(", ") || "-",
              employee.availability.map((a) => a.label).join(", ") || "-",
              <EmployeeActions key="actions" employee={serializeData(employee)} />,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
