"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Field, SubmitButton } from "@/components/ui";
import { updateEmployeeAction, deleteEmployeeAction } from "@/app/actions";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { toast } from "sonner";

export function EmployeeModal({ employee, isOpen, onClose }: { employee: any, isOpen: boolean, onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'employé">
      <form 
        action={async (data) => {
          try {
            await updateEmployeeAction(employee.id, data);
            toast.success("Employé modifié avec succès");
            onClose();
          } catch (error) {
            toast.error("Erreur lors de la modification de l'employé");
          }
        }} 
        className="grid gap-4 md:grid-cols-2"
      >
        <Field label="Nom complet" name="fullName" defaultValue={employee.fullName} required />
        <Field label="Telephone" name="phone" defaultValue={employee.phone} required />
        <Field label="Adresse" name="address" defaultValue={employee.address || ""} />
        <Field label="Competence" name="competency" defaultValue={employee.competency} required />
        <div className="md:col-span-2">
          <Field label="Disponibilite" name="availability" defaultValue={employee.availability || ""} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <SubmitButton label="Enregistrer les modifications" />
        </div>
      </form>
    </Modal>
  );
}

export function EmployeeActions({ employee }: { employee: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <EditActionButton onClick={() => setIsOpen(true)} />
      <DeleteActionButton action={deleteEmployeeAction} id={employee.id} />
      {isOpen && <EmployeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} employee={employee} />}
    </div>
  );
}
