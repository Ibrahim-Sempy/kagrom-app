import { Prisma, Role } from "@prisma/client";
import { DataTable, PageHeader, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";
import { EmployeeNotesForm } from "./EmployeeNotesForm";
import { LearnerNotesForm } from "./LearnerNotesForm";
import { NotesTabs } from "./NotesTabs";
import { NotesToolbar } from "./NotesToolbar";
import { calculateAverage, formatScore, getMentionFromAverage } from "./note-utils";

export const revalidate = 0;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolvePageSize(value: string, fallback: number) {
  const parsed = parsePositiveInt(value, fallback);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number]) ? parsed : fallback;
}

function getMentionClass(mention: string) {
  switch (mention) {
    case "Tres bien":
      return "bg-[rgba(56,91,42,0.12)] text-[color:var(--brand-green)]";
    case "Bien":
    case "Assez bien":
      return "bg-[rgba(200,135,42,0.12)] text-[color:var(--brand-gold)]";
    case "Passable":
      return "bg-[rgba(59,130,246,0.12)] text-[#1d4ed8]";
    case "Insuffisant":
      return "bg-[rgba(220,38,38,0.12)] text-[#b91c1c]";
    default:
      return "bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]";
  }
}

type NotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);

  const params = await searchParams;
  const activeTab = readSearchParam(params.tab) === "employees" ? "employees" : "learners";

  if (activeTab === "employees") {
    const employeeFilterId = readSearchParam(params.employeeFilterId);
    const serviceFilterId = readSearchParam(params.employeeServiceId);
    const employeePageSize = resolvePageSize(readSearchParam(params.employeePageSize), 10);
    const requestedEmployeePage = parsePositiveInt(readSearchParam(params.employeePage), 1);

    const employeeWhere: Prisma.NoteEmployeeWhereInput = {};

    if (employeeFilterId || serviceFilterId) {
      employeeWhere.personalTraining = {
        ...(employeeFilterId ? { employeeId: employeeFilterId } : {}),
        ...(serviceFilterId ? { serviceId: serviceFilterId } : {}),
      };
    }

    const [employees, services, personalTrainings, totalEmployeeNotes] = await Promise.all([
      prisma.employee.findMany({
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.service.findMany({
        orderBy: { label: "asc" },
        select: { id: true, label: true },
      }),
      prisma.personalTraining.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          service: { select: { label: true } },
          duree: { select: { label: true } },
        },
      }),
      prisma.noteEmployee.count({ where: employeeWhere }),
    ]);

    const employeeTotalPages = Math.max(1, Math.ceil(totalEmployeeNotes / employeePageSize));
    const employeePage = Math.min(requestedEmployeePage, employeeTotalPages);

    const employeeNotes = await prisma.noteEmployee.findMany({
      where: employeeWhere,
      skip: (employeePage - 1) * employeePageSize,
      take: employeePageSize,
      orderBy: { createdAt: "desc" },
      include: {
        personalTraining: {
          include: {
            employee: true,
            service: true,
            duree: true,
          },
        },
      },
    });

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Formation et suivi"
          title="Notes & Evaluations"
          description="Gerez separement les resultats des apprenants et les evaluations des employes avec formulaires repliables, filtres et pagination."
          action={<NotesTabs activeTab={activeTab} />}
        />

        <EmployeeNotesForm
          personalTrainings={personalTrainings.map((training) => ({
            value: training.id,
            label: `${training.employee.firstName} ${training.employee.lastName} - ${training.service.label} - ${training.duree.label}`,
          }))}
        />

        <Panel
          title="Tableau des notes employes"
          description="Filtrez les evaluations par employe et service, puis consultez la moyenne et la mention calculees automatiquement."
        >
          <NotesToolbar
            scope="employee"
            activeTab={activeTab}
            fields={[
              {
                name: "employeeFilterId",
                label: "Filtrer par employe",
                defaultValue: employeeFilterId,
                options: employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.firstName} ${employee.lastName}`,
                })),
              },
              {
                name: "employeeServiceId",
                label: "Filtrer par service",
                defaultValue: serviceFilterId,
                options: services.map((service) => ({
                  value: service.id,
                  label: service.label,
                })),
              },
            ]}
            page={employeePage}
            pageSize={employeePageSize}
            totalPages={employeeTotalPages}
            totalItems={totalEmployeeNotes}
            currentCount={employeeNotes.length}
          />

          <div className="mt-6">
            {employeeNotes.length ? (
              <DataTable
                headers={["Employe", "Service", "Duree", "Theorique", "Pratique", "Moyenne", "Mention", "Observation", "Saisie"]}
                rows={employeeNotes.map((note) => {
                  const theory = decimalToNumber(note.scoreTheory);
                  const practical = decimalToNumber(note.scorePractical);
                  const average = calculateAverage(theory, practical);
                  const mention = getMentionFromAverage(average);

                  return [
                    <div key={`${note.id}-employee`}>
                      <p className="font-semibold">
                        {note.personalTraining.employee.firstName} {note.personalTraining.employee.lastName}
                      </p>
                      <p className="text-xs text-[color:var(--foreground-muted)]">Formation employee</p>
                    </div>,
                    note.personalTraining.service.label,
                    note.personalTraining.duree.label,
                    formatScore(theory),
                    formatScore(practical),
                    formatScore(average),
                    <span
                      key={`${note.id}-mention`}
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMentionClass(mention)}`}
                    >
                      {mention}
                    </span>,
                    note.observation || "-",
                    formatDate(note.createdAt),
                  ];
                })}
              />
            ) : (
              <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-5 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
                Aucune note employee ne correspond aux filtres selectionnes.
              </div>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  const learnerFilterId = readSearchParam(params.learnerFilterId);
  const learnerModuleId = readSearchParam(params.learnerModuleId);
  const learnerEnrollmentId = readSearchParam(params.learnerEnrollmentId);
  const learnerPageSize = resolvePageSize(readSearchParam(params.learnerPageSize), 10);
  const requestedLearnerPage = parsePositiveInt(readSearchParam(params.learnerPage), 1);

  const learnerWhere: Prisma.NoteWhereInput = {};

  if (learnerFilterId) {
    learnerWhere.learnerId = learnerFilterId;
  }

  if (learnerModuleId) {
    learnerWhere.moduleId = learnerModuleId;
  }

  if (learnerEnrollmentId) {
    learnerWhere.enrollmentId = learnerEnrollmentId;
  }

  const [learners, modules, enrollments, totalLearnerNotes] = await Promise.all([
    prisma.learner.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, registrationNo: true },
    }),
    prisma.trainingModule.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        learner: { select: { firstName: true, lastName: true, registrationNo: true } },
        Session: { select: { label: true } },
      },
    }),
    prisma.note.count({ where: learnerWhere }),
  ]);

  const learnerTotalPages = Math.max(1, Math.ceil(totalLearnerNotes / learnerPageSize));
  const learnerPage = Math.min(requestedLearnerPage, learnerTotalPages);

  const learnerNotes = await prisma.note.findMany({
    where: learnerWhere,
    skip: (learnerPage - 1) * learnerPageSize,
    take: learnerPageSize,
    orderBy: { createdAt: "desc" },
    include: {
      learner: true,
      module: true,
    },
  });

  const enrollmentMap = new Map(
    enrollments.map((enrollment) => [
      enrollment.id,
      {
        label: `${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
        registrationNo: enrollment.learner.registrationNo,
        sessionLabel: enrollment.Session.label,
      },
    ]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formation et suivi"
        title="Notes & Evaluations"
        description="Gerez separement les resultats des apprenants et les evaluations des employes avec formulaires repliables, filtres et pagination."
        action={<NotesTabs activeTab={activeTab} />}
      />

      <LearnerNotesForm
        enrollments={enrollments.map((enrollment) => ({
          value: enrollment.id,
          label: `${enrollment.learner.firstName} ${enrollment.learner.lastName} - ${enrollment.Session.label}`,
        }))}
        modules={modules.map((module) => ({
          value: module.id,
          label: module.name,
        }))}
      />

      <Panel
        title="Tableau des notes apprenants"
        description="Filtrez les notes par apprenant, module ou inscription, puis consultez la moyenne et la mention calculees automatiquement."
      >
        <NotesToolbar
          scope="learner"
          activeTab={activeTab}
          fields={[
            {
              name: "learnerFilterId",
              label: "Filtrer par apprenant",
              defaultValue: learnerFilterId,
              options: learners.map((learner) => ({
                value: learner.id,
                label: `${learner.firstName} ${learner.lastName}`,
              })),
            },
            {
              name: "learnerModuleId",
              label: "Filtrer par module",
              defaultValue: learnerModuleId,
              options: modules.map((module) => ({
                value: module.id,
                label: module.name,
              })),
            },
            {
              name: "learnerEnrollmentId",
              label: "Filtrer par inscription",
              defaultValue: learnerEnrollmentId,
              options: enrollments.map((enrollment) => ({
                value: enrollment.id,
                label: `${enrollment.learner.firstName} ${enrollment.learner.lastName} - ${enrollment.Session.label}`,
              })),
            },
          ]}
          page={learnerPage}
          pageSize={learnerPageSize}
          totalPages={learnerTotalPages}
          totalItems={totalLearnerNotes}
          currentCount={learnerNotes.length}
        />

        <div className="mt-6">
          {learnerNotes.length ? (
            <DataTable
              headers={["Apprenant", "Inscription", "Module", "Theorique", "Pratique", "Moyenne", "Mention", "Observation", "Saisie"]}
              rows={learnerNotes.map((note) => {
                const theory = decimalToNumber(note.scoreTheory);
                const practical = decimalToNumber(note.scorePractical);
                const average = calculateAverage(theory, practical);
                const mention = getMentionFromAverage(average);
                const enrollmentInfo = note.enrollmentId ? enrollmentMap.get(note.enrollmentId) : undefined;

                return [
                  <div key={`${note.id}-learner`}>
                    <p className="font-semibold">
                      {note.learner?.firstName} {note.learner?.lastName}
                    </p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{note.learner?.registrationNo || "-"}</p>
                  </div>,
                  <div key={`${note.id}-enrollment`}>
                    <p className="font-semibold">{enrollmentInfo?.sessionLabel || "Sans session"}</p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{enrollmentInfo?.registrationNo || "-"}</p>
                  </div>,
                  note.module?.name || "-",
                  formatScore(theory),
                  formatScore(practical),
                  formatScore(average),
                  <span
                    key={`${note.id}-mention`}
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMentionClass(mention)}`}
                  >
                    {mention}
                  </span>,
                  note.observation || "-",
                  formatDate(note.createdAt),
                ];
              })}
            />
          ) : (
            <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-5 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
              Aucune note apprenant ne correspond aux filtres selectionnes.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
