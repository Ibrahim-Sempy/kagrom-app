"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Field, SelectField, SubmitButton } from "@/components/ui";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { toast } from "sonner";
import {
  updateTrainingSessionAction,
  deleteTrainingSessionAction,
  updateTrainingLocationAction,
  deleteTrainingLocationAction,
  updateDurationOptionAction,
  deleteDurationOptionAction,
  updateOperatorTypeAction,
  deleteOperatorTypeAction,
  updateTrainingModuleAction,
  deleteTrainingModuleAction,
  updatePaymentModeOptionAction,
  deletePaymentModeOptionAction,
  updatePaymentInstallmentAction,
  deletePaymentInstallmentAction,
} from "@/app/actions";

// Generic Action Wrapper
export function ParamActions({ 
  item, 
  deleteAction, 
  ModalComponent,
  ...modalProps
}: { 
  item: any, 
  deleteAction: (id: string) => Promise<void>,
  ModalComponent: React.ComponentType<any>,
  [key: string]: any
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <EditActionButton onClick={() => setIsOpen(true)} />
      <DeleteActionButton action={deleteAction} id={item.id} />
      {isOpen && <ModalComponent isOpen={isOpen} onClose={() => setIsOpen(false)} item={item} {...modalProps} />}
    </div>
  );
}

// Session
export function SessionModal({ item, isOpen, onClose, trainings }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Session">
      <form action={async (data) => {
        try { await updateTrainingSessionAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); }
      }} className="grid gap-4 md:grid-cols-2">
        <Field label="Nom" name="name" defaultValue={item.name} required />
        <Field label="Numero" name="sessionNumber" type="number" defaultValue={item.sessionNumber} required />
        <Field label="Date debut" name="startDate" type="date" defaultValue={item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ""} required />
        <Field label="Date fin" name="endDate" type="date" defaultValue={item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ""} required />
        <Field label="Lieu" name="location" defaultValue={item.location} />
        <Field label="Formateur" name="trainerName" defaultValue={item.trainerName} />
        <SelectField label="Formation" name="trainingId" defaultValue={item.trainingId} required options={trainings.map((t:any) => ({ value: t.id, label: t.title }))} />
        <div className="md:col-span-2 flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}

export const SessionActions = (props: any) => <ParamActions {...props} deleteAction={deleteTrainingSessionAction} ModalComponent={SessionModal} />;

// Location
export function LocationModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Lieu">
      <form action={async (data) => { try { await updateTrainingLocationAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Lieu" name="name" defaultValue={item.name} required />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const LocationActions = (props: any) => <ParamActions {...props} deleteAction={deleteTrainingLocationAction} ModalComponent={LocationModal} />;

// Duration
export function DurationModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Duree">
      <form action={async (data) => { try { await updateDurationOptionAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Libelle" name="label" defaultValue={item.label} required />
        <Field label="Mois" name="months" type="number" defaultValue={item.months} />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const DurationActions = (props: any) => <ParamActions {...props} deleteAction={deleteDurationOptionAction} ModalComponent={DurationModal} />;

// Operator Type
export function OperatorTypeModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Type">
      <form action={async (data) => { try { await updateOperatorTypeAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Type" name="name" defaultValue={item.name} required />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const OperatorTypeActions = (props: any) => <ParamActions {...props} deleteAction={deleteOperatorTypeAction} ModalComponent={OperatorTypeModal} />;

// Module
export function ModuleModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Module">
      <form action={async (data) => { try { await updateTrainingModuleAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Module" name="name" defaultValue={item.name} required />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const ModuleActions = (props: any) => <ParamActions {...props} deleteAction={deleteTrainingModuleAction} ModalComponent={ModuleModal} />;

// Payment Mode
export function PaymentModeModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Mode">
      <form action={async (data) => { try { await updatePaymentModeOptionAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Mode" name="label" defaultValue={item.label} required />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const PaymentModeActions = (props: any) => <ParamActions {...props} deleteAction={deletePaymentModeOptionAction} ModalComponent={PaymentModeModal} />;

// Payment Installment
export function InstallmentModal({ item, isOpen, onClose }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Tranche">
      <form action={async (data) => { try { await updatePaymentInstallmentAction(item.id, data); toast.success("Modifié"); onClose(); } catch (e) { toast.error("Erreur"); } }} className="grid gap-4">
        <Field label="Libelle" name="label" defaultValue={item.label} required />
        <Field label="Ordre" name="sortOrder" type="number" defaultValue={item.sortOrder} />
        <div className="flex justify-end"><SubmitButton label="Enregistrer" /></div>
      </form>
    </Modal>
  );
}
export const InstallmentActions = (props: any) => <ParamActions {...props} deleteAction={deletePaymentInstallmentAction} ModalComponent={InstallmentModal} />;
