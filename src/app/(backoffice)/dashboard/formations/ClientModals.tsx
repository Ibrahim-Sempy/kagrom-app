"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { updateTrainingAction, deleteTrainingAction, updateEnrollmentAction, deleteEnrollmentAction } from "@/app/actions";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { toast } from "sonner";
import { decimalToNumber } from "@/lib/utils";

export function TrainingModal({ training, isOpen, onClose }: { training: any, isOpen: boolean, onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la formation">
      <form 
        action={async (data) => {
          try {
            await updateTrainingAction(training.id, data);
            toast.success("Formation modifiée avec succès");
            onClose();
          } catch (error) {
            toast.error("Erreur lors de la modification de la formation");
          }
        }} 
        className="grid gap-4 md:grid-cols-2"
      >
        <Field label="Titre" name="title" defaultValue={training.title} required />
        <Field label="Categorie" name="category" defaultValue={training.category} required />
        <Field label="Duree (jours)" name="durationDays" type="number" defaultValue={training.durationDays} required />
        <Field label="Tarif" name="fee" type="number" defaultValue={decimalToNumber(training.fee)} required />
        <div className="md:col-span-2">
          <TextArea label="Description" name="description" placeholder={training.description || ""} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <SubmitButton label="Enregistrer" />
        </div>
      </form>
    </Modal>
  );
}

export function TrainingActions({ training }: { training: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 mt-2">
      <EditActionButton onClick={() => setIsOpen(true)} />
      <DeleteActionButton action={deleteTrainingAction} id={training.id} />
      {isOpen && <TrainingModal isOpen={isOpen} onClose={() => setIsOpen(false)} training={training} />}
    </div>
  );
}

export function EnrollmentModal({ 
  enrollment, 
  sessions,
  operatorTypes,
  modules,
  locations,
  durations,
  paymentModes,
  isOpen, 
  onClose 
}: { 
  enrollment: any, 
  sessions: any[],
  operatorTypes: any[],
  modules: any[],
  locations: any[],
  durations: any[],
  paymentModes: any[],
  isOpen: boolean, 
  onClose: () => void 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'inscription">
      <form 
        action={async (data) => {
          try {
            await updateEnrollmentAction(enrollment.id, data);
            toast.success("Inscription modifiée avec succès");
            onClose();
          } catch (error) {
            toast.error("Erreur lors de la modification de l'inscription");
          }
        }} 
        className="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Matricule" name="matricule" defaultValue={enrollment.matricule} required />
          <SelectField
            label="Session"
            name="trainingSessionId"
            required
            defaultValue={enrollment.trainingSessionId}
            options={sessions.map((s) => ({ value: s.id, label: `${s.training.title} - ${s.name}` }))}
          />
          <Field label="Date d'Inscription" name="registrationDate" type="date" defaultValue={enrollment.registrationDate ? new Date(enrollment.registrationDate).toISOString().split('T')[0] : ""} required />
          <SelectField label="Type Operateur" name="operatorTypeId" defaultValue={enrollment.operatorTypeId || ""} options={operatorTypes.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectField label="Module" name="trainingModuleId" defaultValue={enrollment.trainingModuleId || ""} options={modules.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectField label="Lieu de Formation" name="trainingLocationId" defaultValue={enrollment.trainingLocationId || ""} options={locations.map((item) => ({ value: item.id, label: item.name }))} />
          <SelectField label="Duree" name="durationOptionId" defaultValue={enrollment.durationOptionId || ""} options={durations.map((item) => ({ value: item.id, label: item.label }))} />
          <SelectField label="Mode de Paiement" name="paymentModeOptionId" defaultValue={enrollment.paymentModeOptionId || ""} options={paymentModes.map((item) => ({ value: item.id, label: item.label }))} />
          <Field label="Prix Inscription" name="registrationFee" type="number" defaultValue={decimalToNumber(enrollment.registrationFee)} required />
          <Field label="Frais Formation" name="trainingFee" type="number" defaultValue={decimalToNumber(enrollment.trainingFee)} required />
        </div>
        <div className="flex justify-end pt-4">
          <SubmitButton label="Enregistrer" />
        </div>
      </form>
    </Modal>
  );
}

export function EnrollmentActions({ enrollment, sessions, operatorTypes, modules, locations, durations, paymentModes }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 border-t border-[color:var(--stroke)] mt-3 pt-3">
      <EditActionButton onClick={() => setIsOpen(true)} />
      <DeleteActionButton action={deleteEnrollmentAction} id={enrollment.id} />
      {isOpen && (
        <EnrollmentModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          enrollment={enrollment} 
          sessions={sessions}
          operatorTypes={operatorTypes}
          modules={modules}
          locations={locations}
          durations={durations}
          paymentModes={paymentModes}
        />
      )}
    </div>
  );
}
