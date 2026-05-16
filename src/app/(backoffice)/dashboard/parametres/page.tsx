import {
  createDurationOptionAction,
  createOperatorTypeAction,
  createPaymentInstallmentAction,
  createPaymentModeOptionAction,
  createTrainingLocationAction,
  createTrainingModuleAction,
  createTrainingSessionAction,
  createAvailabilityAction,
  createServiceAction,

} from "@/app/actions";
import { 
  SessionActions, 
  LocationActions, 
  DurationActions, 
  OperatorTypeActions, 
  ModuleActions, 
  PaymentModeActions, 
  InstallmentActions, 
  AvailabilityActions,
  ServiceActions
} from "./ClientModals";
import { DataTable, Field, TextArea, Panel, SelectField,  SubmitButton } from "@/components/ui";
import { serializeData } from "@/lib/utils";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function SettingsPage() {
  await requireRole([Role.ADMIN]);

  const [sessions, locations, durations, operatorTypes, modules, modes, installments, availabilities, services] = await Promise.all([
    prisma.session.findMany({ orderBy: { label: "asc" } }),
    prisma.trainingLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.durationOption.findMany({ orderBy: { label: "asc" } }),
    prisma.operatorType.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingModule.findMany({ orderBy: { name: "asc" } }),
    prisma.paymentModeOption.findMany({ orderBy: { label: "asc" } }),
    prisma.paymentInstallment.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.availability.findMany({ orderBy: { label: "asc" } }),
    prisma.service.findMany({ orderBy: { label: "asc" } }),
  ]);

  // const trainings = await prisma.training.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Configuration"
        title="Parametres"
        description="Administration des sessions, lieux, durees, types operateurs, modules, modes et tranches de paiement."
      /> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Sessions" description="Ajout rapide d'une session de formation.">
          <form action={createTrainingSessionAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Label" name="label" required />
            {/* <Field label="Numero" name="sessionNumber" type="number" required /> */}
            <Field label="Date debut" name="startDate" type="date" required />
            <Field label="Date fin" name="endDate" type="date" required />
            {/* <Field label="Lieu" name="location" />
            <Field label="Formateur" name="trainerName" /> */}
            {/* <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Formation</span>
              <select name="trainingId" required className="h-12 w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4">
                <option value="">Selectionner</option>
                {trainings.map((training) => (
                  <option key={training.id} value={training.id}>{training.title}</option>
                ))}
              </select>
            </label> */}
            <div className="md:col-span-2"><SubmitButton label="Ajouter Session" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {sessions.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.label}</span>
                <SessionActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Lieux de Formation" description="Liste des lieux proposes dans les formulaires.">
          <form action={createTrainingLocationAction} className="flex gap-3">
            <div className="flex-1"><Field label="Lieu" name="name" required /></div>
            <div className="self-end"><SubmitButton label="Ajouter Lieu" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {locations.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.name}</span>
                <LocationActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Durees" description="Durees standard de formation.">
          <form action={createDurationOptionAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <Field label="Libelle" name="label" required />
            <Field label="Mois" name="months" type="number" />
            <div className="self-end"><SubmitButton label="Ajouter Duree" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {durations.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.label}</span>
                <DurationActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Types Operateurs" description="Types d'operateurs visibles dans les inscriptions.">
          <form action={createOperatorTypeAction} className="flex gap-3">
            <div className="flex-1"><Field label="Type" name="name" required /></div>
            <div className="self-end"><SubmitButton label="Ajouter Type" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {operatorTypes.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.name}</span>
                <OperatorTypeActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Modules" description="Catalogue de modules de formation.">
          <form action={createTrainingModuleAction} className="flex gap-3">
            <div className="flex-1"><Field label="Module" name="name" required /></div>
            <div className="flex-1">
              <SelectField
                label="Type d'opérateur"
                name="operatorTypeId"
                options={operatorTypes.map((t) => ({ value: t.id, label: t.name }))}
              ></SelectField>
            </div>
            <div className="self-end"><SubmitButton label="Ajouter Module" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {modules.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.name}</span>
                <ModuleActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Modes de Paiement" description="Modes disponibles lors de l'inscription et du paiement.">
          <form action={createPaymentModeOptionAction} className="flex gap-3">
            <div className="flex-1"><Field label="Mode" name="label" required /></div>
            <div className="self-end"><SubmitButton label="Ajouter Mode" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {modes.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.label}</span>
                <PaymentModeActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* gestion de services */}
        <Panel title="Services" description="Configuration des services proposés.">
          <form action={createServiceAction} className="grid gap-4 md:grid-cols-1">
            <div className="flex-1"><Field label="Service" name="label" required /></div>
            <div><TextArea  label="Description" name="description" /></div>
            <div className="self-end"><SubmitButton label="Ajouter Service" /></div>
          </form>
          {/* liste des services */}
          <div className="mt-5 space-y-2">
            {services.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <div>
                  <p>{item.label}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{item.description}</p>
                </div>
                <ServiceActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* panel pour les disponibilites */}
        <Panel title="Disponibilités" description="Configuration des disponibilités des formateurs.">
          <form action={createAvailabilityAction} className="flex gap-3">
            <div className="flex-1"><Field label="Disponibilité" name="label" required /></div>
            <div className="self-end"><SubmitButton label="Ajouter Disponibilité" /></div>
          </form>
          <div className="mt-5 space-y-2">
            {availabilities.map((item) => (
              <div key={item.id} className="flex justify-between items-center rounded-2xl border border-[color:var(--stroke)] px-4 py-3">
                <span>{item.label}</span>
                <AvailabilityActions item={serializeData(item)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Tranches de Paiement" description="Configuration des tranches visibles dans les paiements.">
          <form action={createPaymentInstallmentAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <Field label="Libelle" name="label" required />
            <Field label="Ordre" name="sortOrder" type="number" />
            <div className="self-end"><SubmitButton label="Ajouter Tranche" /></div>
          </form>
          <div className="mt-5">
            <DataTable
              headers={["Tranche", "Ordre", "Actions"]}
              rows={installments.map((item) => [
                item.label, 
                item.sortOrder.toString(),
                <InstallmentActions key="actions" item={serializeData(item)} />
              ])}
            />
          </div>
        </Panel>

      
    </div>
  );
}
