import { createEnrollmentAction } from "@/app/actions";
import { Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextCode } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function EnrollmentsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const [sessions, operatorTypes, modules, locations, durations, paymentModes] = await Promise.all([
    prisma.trainingSession.findMany({ orderBy: { startDate: "desc" }, include: { training: true } }),
    prisma.operatorType.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingModule.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.durationOption.findMany({ orderBy: { label: "asc" } }),
    prisma.paymentModeOption.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formation"
        title="Nouvelle inscription"
        description="Conservez la logique de l'application existante avec un formulaire d'inscription complet, relie aux sessions, modules, lieux, durees et frais."
      />

      <Panel title="Nouvelle Inscription" description="Informations personnelles, formation, contact d'urgence et frais de formation.">
        <form action={createEnrollmentAction} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Matricule" name="matricule" defaultValue={nextCode("MAT")} required />
            <SelectField
              label="Session"
              name="trainingSessionId"
              required
              options={sessions.map((session) => ({
                value: session.id,
                label: `${session.name} - ${session.training.title}`,
              }))}
            />
            <Field label="Prenom" name="firstName" required />
            <Field label="Nom" name="lastName" required />
            <Field label="Date de Naissance" name="birthDate" type="date" />
            <Field label="Lieu de Naissance" name="birthPlace" />
            <Field label="Telephone" name="phone" required />
            <Field label="Email" name="email" type="email" />
            <Field label="Adresse" name="address" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectField label="Type Operateur" name="operatorTypeId" options={operatorTypes.map((item) => ({ value: item.id, label: item.name }))} />
            <SelectField label="Module" name="trainingModuleIds" options={modules.map((item) => ({ value: item.id, label: item.name }))} />
            <SelectField label="Lieu de Formation" name="trainingLocationId" options={locations.map((item) => ({ value: item.id, label: item.name }))} />
            <SelectField label="Duree" name="durationOptionId" options={durations.map((item) => ({ value: item.id, label: item.label }))} />
            <Field label="Date d'Inscription" name="registrationDate" type="date" required />
            <Field label="Profession" name="occupation" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Prenom Responsable" name="emergencyContactFirstName" />
            <Field label="Nom Responsable" name="emergencyContactLastName" />
            <Field label="Telephone Responsable" name="emergencyPhone" />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Prix Inscription" name="registrationFee" type="number" required />
            <Field label="Frais Formation" name="trainingFee" type="number" required />
            <SelectField label="Mode de Paiement" name="paymentModeOptionId" options={paymentModes.map((item) => ({ value: item.id, label: item.label }))} />
            <Field label="Photo" name="photo" type="file" accept="image/*" />
          </div>

          <SubmitButton label="Enregistrer l'Inscription" />
        </form>
      </Panel>
    </div>
  );
}
