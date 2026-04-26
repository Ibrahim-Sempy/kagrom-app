import Link from "next/link";
import { createTrainingAction, createTrainingSessionAction, enrollLearnerAction, recordResultAction } from "@/app/actions";
import { TrainingActions, EnrollmentActions } from "./ClientModals";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate, serializeData } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function TrainingsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const [trainings, sessions, learners, enrollments, operatorTypes, modules, locations, durations, paymentModes] = await Promise.all([
    prisma.training.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.trainingSession.findMany({
      orderBy: { startDate: "desc" },
      include: { training: true },
    }),
    prisma.learner.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        learner: true,
        trainingSession: {
          include: { training: true },
        },
        certificate: true,
      },
    }),
    prisma.operatorType.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingModule.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.durationOption.findMany({ orderBy: { label: "asc" } }),
    prisma.paymentModeOption.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestion des formations"
        title="Catalogue, sessions, inscriptions et notation"
        description="Creez vos formations, ouvrez des sessions, inscrivez les apprenants et calculez automatiquement les resultats."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nouvelle formation" description="Structure tarifaire et informations pedagogiques.">
          <form action={createTrainingAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Titre" name="title" required />
            <Field label="Categorie" name="category" required />
            <Field label="Duree (jours)" name="durationDays" type="number" required />
            <Field label="Tarif" name="fee" type="number" required />
            <div className="md:col-span-2">
              <TextArea label="Description" name="description" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Creer la formation" />
            </div>
          </form>
        </Panel>

        <Panel title="Nouvelle session" description="Planifiez une promotion et rattachez-la a une formation existante.">
          <form action={createTrainingSessionAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Nom de session" name="name" required />
            <Field label="Numero de session" name="sessionNumber" type="number" required />
            <SelectField
              label="Formation"
              name="trainingId"
              required
              options={trainings.map((training) => ({ value: training.id, label: training.title }))}
            />
            <Field label="Lieu" name="location" />
            <Field label="Date de debut" name="startDate" type="date" required />
            <Field label="Date de fin" name="endDate" type="date" required />
            <div className="md:col-span-2">
              <Field label="Formateur" name="trainerName" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Ouvrir la session" />
            </div>
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
              name="trainingSessionId"
              required
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.training.title} - ${session.name}`,
              }))}
            />
            <SubmitButton label="Inscrire l'apprenant" />
          </form>

          <div className="mt-6 rounded-[24px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-4">
            <p className="text-sm font-semibold text-[color:var(--brand-green)]">Catalogue actuel</p>
            <div className="mt-3 space-y-3">
              {trainings.map((training) => (
                <div key={training.id} className="rounded-2xl bg-white px-4 py-3">
                  <p className="font-semibold">{training.title}</p>
                  <p className="text-sm text-[color:var(--foreground-muted)]">
                    {training.durationDays} jours • {formatCurrency(decimalToNumber(training.fee))}
                  </p>
                  <TrainingActions training={serializeData(training)} />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Suivi des participants" description="Enregistrez les notes et editez certificats et badges.">
          <DataTable
            headers={["Apprenant", "Session", "Moyenne", "Statut", "Actions"]}
            rows={enrollments.map((enrollment) => [
              <div key="learner">
                <p className="font-semibold">
                  {enrollment.learner.firstName} {enrollment.learner.lastName}
                </p>
                <p className="text-xs text-[color:var(--foreground-muted)]">Matricule: {enrollment.matricule}</p>
              </div>,
              <div key="session">
                <p>{enrollment.trainingSession.training.title}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">
                  {enrollment.trainingSession.name} • {formatDate(enrollment.trainingSession.startDate)}
                </p>
              </div>,
              enrollment.averageScore ? decimalToNumber(enrollment.averageScore).toFixed(2) : "-",
              enrollment.status,
              <div key="actions" className="space-y-3">
                <form action={recordResultAction} className="grid gap-2 md:grid-cols-2">
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <input
                    name="scoreTheory"
                    type="number"
                    step="0.01"
                    placeholder="Note theorique"
                    className="h-10 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-3"
                  />
                  <input
                    name="scorePractical"
                    type="number"
                    step="0.01"
                    placeholder="Note pratique"
                    className="h-10 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-3"
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--brand-green)] px-3 text-xs font-semibold text-white"
                  >
                    Valider les resultats
                  </button>
                </form>

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
                  operatorTypes={serializeData(operatorTypes)} 
                  modules={serializeData(modules)} 
                  locations={serializeData(locations)} 
                  durations={serializeData(durations)} 
                  paymentModes={serializeData(paymentModes)} 
                />
              </div>,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
