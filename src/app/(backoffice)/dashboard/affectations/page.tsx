import { Prisma, Role } from "@prisma/client";
import { DataTable, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentsToolbar } from "./AssignmentsToolbar";
import { Decimal } from "@prisma/client/runtime/library";

export const revalidate = 0;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildStartDateFilter(startDate: string): Prisma.DateTimeFilter | undefined {
  if (!startDate) {
    return undefined;
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { gte: start, lt: end };
}

function formatMonthlyAmount(value: Decimal) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? formatCurrency(parsed) : value.toString();
}

type AssignmentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const params = await searchParams;
  const employeeId = readSearchParam(params.employeeId);
  const householdId = readSearchParam(params.householdId);
  const startDate = readSearchParam(params.startDate);
  const requestedPage = parsePage(readSearchParam(params.page), 1);
  const requestedPageSize = parsePage(readSearchParam(params.pageSize), 10);
  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? requestedPageSize : 10;

  const where: Prisma.AssignmentWhereInput = {};

  if (employeeId) {
    where.employeeId = employeeId;
  }

  if (householdId) {
    where.householdId = householdId;
  }

  const startDateFilter = buildStartDateFilter(startDate);
  if (startDateFilter) {
    where.startDate = startDateFilter;
  }

  const [employees, households, services, availabilities, totalAssignments] = await Promise.all([
    prisma.employee.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.household.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.service.findMany({
      orderBy: { label: "asc" },
      select: { id: true, label: true, description: true },
    }),
    prisma.availability.findMany({
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    }),
    prisma.assignment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalAssignments / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const assignments = await prisma.assignment.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { startDate: "desc" },
    include: {
      employee: true,
      household: true,
      services: true,
      horaire: true,
    },
  });

  const employeeOptions = employees.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));

  const householdOptions = households.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Services Menagers"
        title="Affectations Employes & Foyers"
        description="Creez des affectations conformes au modele Assignment, filtrez les dossiers et naviguez dans les resultats avec une pagination pilotee par le serveur."
      /> */}

      <AssignmentForm
        employees={employeeOptions}
        households={householdOptions}
        services={services}
        availabilities={availabilities.map((item) => ({
          id: item.id,
          label: item.label,
          description: "Creneau disponible pour cette affectation.",
        }))}
      />

      <Panel
        title="Affectations enregistrees"
        description="Consultez les affectations par employe, foyer et date de debut, puis changez la taille de page directement depuis l'interface."
      >
        <AssignmentsToolbar
          employees={employeeOptions}
          households={householdOptions}
          filters={{ employeeId, householdId, startDate }}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalAssignments}
          currentCount={assignments.length}
        />

        <div className="mt-6">
          {assignments.length ? (
            <DataTable
              headers={["Employe", "Foyer", "Montant/mois", "Services", "Horaire", "Date debut", "Nb. pers.", "Statut"]}
              rows={assignments.map((assignment) => [
                <div key={`${assignment.id}-employee`}>
                  <p className="font-semibold">
                    {assignment.employee.firstName} {assignment.employee.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">ID: {assignment.employeeId}</p>
                </div>,
                <div key={`${assignment.id}-household`}>
                  <p className="font-semibold">
                    {assignment.household.firstName} {assignment.household.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">ID: {assignment.householdId}</p>
                </div>,
                <div key={`${assignment.id}-label`}>
                  <p className="font-semibold">{formatMonthlyAmount(assignment.monthlyAmount)}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{assignment.notes || "Aucune note"}</p>
                </div>,
                <div key={`${assignment.id}-services`} className="flex flex-wrap gap-2">
                  {assignment.services.length ? (
                    assignment.services.map((service) => (
                      <span
                        key={service.id}
                        className="inline-flex rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-medium text-[color:var(--foreground)]"
                      >
                        {service.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[color:var(--foreground-muted)]">Aucun service</span>
                  )}
                </div>,
                <div key={`${assignment.id}-horaire`} className="flex flex-wrap gap-2">
                  {assignment.horaire.length ? (
                    assignment.horaire.map((slot) => (
                      <span
                        key={slot.id}
                        className="inline-flex rounded-full bg-[rgba(56,91,42,0.08)] px-3 py-1 text-xs font-medium text-[color:var(--brand-green)]"
                      >
                        {slot.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[color:var(--foreground-muted)]">Aucun horaire</span>
                  )}
                </div>,
                formatDate(assignment.startDate),
                assignment.numberPerson.toString(),
                <span
                  key={`${assignment.id}-status`}
                  className="inline-flex rounded-full bg-[rgba(200,135,42,0.12)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-gold)]"
                >
                  {assignment.status}
                </span>,
              ])}
            />
          ) : (
            <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-5 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
              Aucune affectation ne correspond aux filtres selectionnes.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
