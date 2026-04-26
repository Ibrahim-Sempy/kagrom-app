import { recordResultAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function NotesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { registrationDate: "desc" },
    include: {
      learner: true,
      trainingModule: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formation"
        title="Notes & Evaluations"
        description="Saisie des notes theoriques et pratiques, calcul automatique de la moyenne et validation de l'apprenant."
      />

      <Panel title="Resultats des Evaluations" description="Enregistrez ou mettez a jour les notes d'un apprenant.">
        <DataTable
          headers={["Matricule", "Nom complet", "Module", "Moyenne", "Mention", "Saisie"]}
          rows={enrollments.map((enrollment) => [
            enrollment.matricule,
            `${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
            enrollment.trainingModule?.name || "-",
            enrollment.averageScore ? decimalToNumber(enrollment.averageScore).toFixed(2) : "-",
            enrollment.resultLabel || enrollment.status,
            <form key="form" action={recordResultAction} className="grid gap-2 md:grid-cols-2">
              <input type="hidden" name="enrollmentId" value={enrollment.id} />
              <input
                name="scoreTheory"
                type="number"
                step="0.01"
                defaultValue={enrollment.scoreTheory ? decimalToNumber(enrollment.scoreTheory) : ""}
                placeholder="Theorique"
                className="h-10 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-3"
              />
              <input
                name="scorePractical"
                type="number"
                step="0.01"
                defaultValue={enrollment.scorePractical ? decimalToNumber(enrollment.scorePractical) : ""}
                placeholder="Pratique"
                className="h-10 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-3"
              />
              <div className="md:col-span-2">
                <Field label="Observation" name="observation" defaultValue={enrollment.observation || ""} />
              </div>
              <div className="md:col-span-2">
                <SubmitButton label="Enregistrer les Notes" />
              </div>
            </form>,
          ])}
        />
      </Panel>
    </div>
  );
}
