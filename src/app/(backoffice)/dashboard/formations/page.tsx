import Link from "next/link";
import { createTrainingSessionAction, enrollLearnerAction, recordResultAction } from "@/app/actions";
import { EnrollmentActions } from "./ClientModals";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate, serializeData } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function TrainingsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const [sessions, learners, enrollments, modules, locations, durations, paymentModes] = await Promise.all([
    prisma.session.findMany({
      orderBy: { startDate: "desc" },
    }),
    prisma.learner.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        learner: true,
        Session: true,
        certificate: true,
        enrollmentModules: { include: { trainingModule: true } },
        notes: true,
      },
    }),
    prisma.trainingModule.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.durationOption.findMany({ orderBy: { label: "asc" } }),
    prisma.paymentModeOption.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Gestion des formations"
        title="Catalogue, sessions, inscriptions et notation"
        description="Creez vos formations, ouvrez des sessions, inscrivez les apprenants et calculez automatiquement les resultats."
      /> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nouvelle session" description="Planifiez une session de formation.">
          <form action={createTrainingSessionAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Nom de session" name="name" required />
            <Field label="Date de debut" name="startDate" type="date" required />
            <Field label="Date de fin" name="endDate" type="date" required />
            <Field label="Formateur" name="trainerName" />
            <div className="md:col-span-2">
              <SubmitButton label="Ouvrir la session" />
            </div>
          </form>
        </Panel>

        <Panel title="Inscrire un apprenant" description="Affectation d'un apprenant a une session de formation.">
          <form action={enrollLearnerAction} className="grid gap-4">
            <SelectField
              label="Apprenant"
              name="learnerId"
              required
              options={learners.map((learner) => ({
                value: learner.id,
                label: `${learner.firstName} ${learner.lastName}`,
              }))}
            />
            <SelectField
              label="Session"
              name="sessionId"
              required
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.label}`,
              }))}
            />
            <SelectField
              label="Modules de formation"
              name="trainingModuleIds"
              options={modules.map((mod) => ({
                value: mod.id,
                label: mod.name,
              }))}
            />
            <SubmitButton label="Inscrire l'apprenant" />
          </form>
        </Panel>
      </div>

        {/* <Panel title="Suivi des participants" description="Enregistrez les notes et editez certificats et badges.">
          <DataTable
            headers={["Apprenant", "Session", "Moyenne", "Statut", "Actions"]}
            rows={enrollments.map((enrollment) => {
              const notes = enrollment.notes || [];
              const averageScore = notes.length > 0
                ? notes.reduce((sum, n) => sum + (Number(n.scoreTheory || 0) + Number(n.scorePractical || 0)) / 2, 0) / notes.length
                : 0;

              return [
                <div key="learner">
                  <p className="font-semibold">
                    {enrollment.learner.firstName} {enrollment.learner.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">Reg: {enrollment.learner.registrationNo}</p>
                </div>,
                <div key="session">
                  <p>{enrollment.Session?.label || "Session"}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">
                    {formatDate(enrollment.Session?.startDate || enrollment.createdAt)}
                  </p>
                </div>,
                averageScore > 0 ? averageScore.toFixed(2) : "-",
                enrollment.status,
                <div key="actions" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/badges/${enrollment.id}`} className="rounded-full border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold">
                      Badge
                    </Link>
                    <Link href={`/releves/${enrollment.id}`} className="rounded-full border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                      Relevé de notes
                    </Link>
                    {enrollment.certificate ? (
                      <Link href={`/certificats/${enrollment.certificate.id}`} className="rounded-full bg-[color:var(--brand-gold)] px-3 py-2 text-xs font-semibold text-white">
                        Certificat
                      </Link>
                    ) : null}
                  </div>
                  <EnrollmentActions
                    enrollment={serializeData(enrollment)}
                    sessions={serializeData(sessions)}
                    modules={serializeData(modules)}
                    locations={serializeData(locations)}
                    durations={serializeData(durations)}
                    paymentModes={serializeData(paymentModes)}
                  />
                </div>,
              ];
            })}
          />
        </Panel> */}
      </div>
   
  );
}
