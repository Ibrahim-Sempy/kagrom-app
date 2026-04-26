import Link from "next/link";
import { createLearnerAction } from "@/app/actions";
import { LearnerActions } from "./ClientModals";
import { serializeData } from "@/lib/utils";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function LearnersPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);

  const learners = await prisma.learner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          trainingSession: {
            include: { training: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestion des apprenants"
        title="Base apprenants et suivi des inscriptions"
        description="Centralisez les informations des apprenants, leurs affectations en formation et l'acces aux badges."
      />

      <div className="grid gap-6">
        <Panel title="Nouvel apprenant" description="Enregistrement rapide avec informations utiles a la production des badges.">
          <form action={createLearnerAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Prenom" name="firstName" required />
            <Field label="Nom" name="lastName" required />
            <Field label="Telephone" name="phone" required />
            <Field label="Email" name="email" type="email" />
            <Field label="Profession" name="occupation" />
            <Field label="Adresse" name="address" />
            <SelectField
              label="Genre"
              name="gender"
              options={[
                { value: "Homme", label: "Homme" },
                { value: "Femme", label: "Femme" },
              ]}
            />
            <Field label="Contact d'urgence" name="emergencyPhone" />
            <div className="md:col-span-2">
              <Field label="Photo" name="photo" type="file" accept="image/*" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Enregistrer l'apprenant" />
            </div>
          </form>
        </Panel>

        <Panel title="Liste des apprenants" description="Chaque profil peut ensuite etre rattache a une session et imprimer un badge.">
          <DataTable
            headers={["Matricule", "Nom", "Telephone", "Statut", "Derniere session", "Badge", "Actions"]}
            rows={learners.map((learner) => {
              const latestEnrollment = learner.enrollments[0];

              return [
                <span key="reg" className="font-semibold">
                  {learner.registrationNo}
                </span>,
                <div key="name">
                  <p className="font-semibold">
                    {learner.firstName} {learner.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{learner.email || "Sans email"}</p>
                </div>,
                learner.phone,
                learner.status,
                latestEnrollment ? (
                  <div key="session">
                    <p>{latestEnrollment.trainingSession.training.title}</p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(latestEnrollment.createdAt)}</p>
                  </div>
                ) : (
                  "Aucune inscription"
                ),
                latestEnrollment ? (
                  <Link
                    key="badge"
                    href={`/badges/${latestEnrollment.id}`}
                    className="inline-flex rounded-full bg-[color:var(--brand-green)] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Imprimer
                  </Link>
                ) : (
                  "-"
                ),
                <LearnerActions key="actions" learner={serializeData(learner)} />,
              ];
            })}
          />
        </Panel>
      </div>
    </div>
  );
}
