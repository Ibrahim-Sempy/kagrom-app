"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Field, SelectField, SubmitButton } from "@/components/ui";
import { updateLearnerAction, deleteLearnerAction } from "@/app/actions";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { toast } from "sonner";

export function LearnerModal({ learner, isOpen, onClose }: { learner: any, isOpen: boolean, onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'apprenant">
      <form 
        action={async (data) => {
          try {
            await updateLearnerAction(learner.id, data);
            toast.success("Apprenant modifié avec succès");
            onClose();
          } catch (error) {
            toast.error("Erreur lors de la modification de l'apprenant");
          }
        }} 
        className="grid gap-4 md:grid-cols-2"
      >
        <Field label="Prenom" name="firstName" defaultValue={learner.firstName} required />
        <Field label="Nom" name="lastName" defaultValue={learner.lastName} required />
        <Field label="Telephone" name="phone" defaultValue={learner.phone} required />
        <Field label="Email" name="email" type="email" defaultValue={learner.email || ""} />
        <Field label="Profession" name="occupation" defaultValue={learner.occupation || ""} />
        <Field label="Adresse" name="address" defaultValue={learner.address || ""} />
        <SelectField
          label="Genre"
          name="gender"
          defaultValue={learner.gender || ""}
          options={[
            { value: "Homme", label: "Homme" },
            { value: "Femme", label: "Femme" },
          ]}
        />
        <Field label="Contact d'urgence" name="emergencyPhone" defaultValue={learner.emergencyPhone || ""} />
        <div className="md:col-span-2">
          <Field label="Photo (laisser vide pour ne pas changer)" name="photo" type="file" accept="image/*" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <SubmitButton label="Enregistrer les modifications" />
        </div>
      </form>
    </Modal>
  );
}

export function LearnerActions({ learner }: { learner: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <EditActionButton onClick={() => setIsOpen(true)} />
      <DeleteActionButton action={deleteLearnerAction} id={learner.id} />
      {isOpen && <LearnerModal isOpen={isOpen} onClose={() => setIsOpen(false)} learner={learner} />}
    </div>
  );
}
