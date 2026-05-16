"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { deleteEnrollmentAction, updateEnrollmentAction } from "@/app/actions";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { toast } from "sonner";
import { decimalToNumber } from "@/lib/utils";

// Training CRUD operations are not available in the current schema

export function EnrollmentModal({
  enrollment,
  sessions,
  modules,
  locations,
  durations,
  paymentModes,
  isOpen,
  onClose
}: {
  enrollment: any,
  sessions: any[],
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
          <SelectField
            label="Session"
            name="sessionId"
            required
            defaultValue={enrollment.SessionId}
            options={sessions.map((s) => ({ value: s.id, label: s.label }))}
          />
          <Field label="Date d'Inscription" name="registrationDate" type="date" defaultValue={enrollment.registrationDate ? new Date(enrollment.registrationDate).toISOString().split('T')[0] : ""} required />
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

export function EnrollmentActions({ enrollment, sessions, modules, locations, durations, paymentModes }: any) {
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
          modules={modules}
          locations={locations}
          durations={durations}
          paymentModes={paymentModes}
        />
      )}
    </div>
  );
}
