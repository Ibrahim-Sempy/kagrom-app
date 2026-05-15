"use client";

import { useState } from "react";
import { ActionButton, Modal } from "./components";
// import { createServiceProviderAction, updateServiceProviderAction, createMissionAction, updateMissionAction } from "@/app/actions";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { toast } from "sonner";

const serviceOptions = [
  { value: "Femmes de menage", label: "Femmes de menage" },
  { value: "Nounous", label: "Nounous" },
  { value: "Aides menageres", label: "Aides menageres" },
  { value: "Agents de nettoyage", label: "Agents de nettoyage" },
  { value: "Cuisiniers / Cuisinieres", label: "Cuisiniers / Cuisinieres" },
  { value: "Chauffeurs", label: "Chauffeurs" },
  { value: "Coursiers", label: "Coursiers" },
  { value: "Assistantes de personnes agees", label: "Assistantes de personnes agees" },
  { value: "Enseignants / Professeurs", label: "Enseignants / Professeurs" },
];

export function ServiceProviderModal({ 
  provider, 
  isOpen, 
  onClose 
}: { 
  provider?: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const isEdit = !!provider;
  // const action = isEdit ? updateServiceProviderAction.bind(null, provider.id) : createServiceProviderAction;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Modifier Fiche Personnel" : "Nouvelle Fiche Personnel"}>
      <form action={async (data) => { 
        try {
          // await action(data); 
          toast.success(isEdit ? "Fiche modifiée avec succès" : "Personnel ajouté avec succès");
          onClose(); 
        } catch (error) {
          toast.error("Erreur lors de l'enregistrement");
        }
      }} className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. Informations Personnelles</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom complet" name="fullName" defaultValue={provider?.fullName} required />
            <Field label="Date de naissance" name="birthDate" type="date" defaultValue={provider?.birthDate ? new Date(provider.birthDate).toISOString().split('T')[0] : ""} />
            <Field label="Lieu de naissance" name="birthPlace" defaultValue={provider?.birthPlace} />
            <Field label="Nationalité" name="nationality" defaultValue={provider?.nationality} />
            <SelectField label="Situation matrimoniale" name="maritalStatus" defaultValue={provider?.maritalStatus} options={[
              { value: "Célibataire", label: "Célibataire" },
              { value: "Marié(e)", label: "Marié(e)" },
              { value: "Autre", label: "Autre" }
            ]} />
            <Field label="Adresse complète" name="address" defaultValue={provider?.address} />
            <Field label="Téléphone principal" name="phone" defaultValue={provider?.phone} required />
            <Field label="Téléphone secondaire" name="secondaryPhone" defaultValue={provider?.secondaryPhone} />
            <Field label="Email" name="email" type="email" defaultValue={provider?.email} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">2. Pièce d'Identité</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SelectField label="Type de pièce" name="idType" defaultValue={provider?.idType} options={[
              { value: "Carte d'identité", label: "Carte d'identité" },
              { value: "Passeport", label: "Passeport" },
              { value: "Autre", label: "Autre" }
            ]} />
            <Field label="Numéro de la pièce" name="idNumber" defaultValue={provider?.idNumber} />
            <Field label="Date d'expiration" name="idExpiryDate" type="date" defaultValue={provider?.idExpiryDate ? new Date(provider.idExpiryDate).toISOString().split('T')[0] : ""} />
            <SelectField label="Copie jointe" name="hasIdCopy" defaultValue={provider?.hasIdCopy ? "true" : "false"} options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" }
            ]} />
          </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold mb-4 border-b pb-2">3. Poste Demandé et Compétences</h3>
           <div className="grid gap-4 md:grid-cols-2">
             <SelectField label="Poste demandé (Catégorie)" name="category" defaultValue={provider?.category} required options={serviceOptions} />
             <Field label="Compétences supplémentaires (séparer par virgule)" name="skills" defaultValue={provider?.skills?.join(", ")} placeholder="Ex: Repassage, Cuisine, Garde bébé..." />
           </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold mb-4 border-b pb-2">4. Expérience Professionnelle</h3>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <SelectField label="Déjà travaillé dans ce domaine?" name="hasExperience" defaultValue={provider?.hasExperience ? "true" : "false"} options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" }
              ]} />
              <Field label="Employeur" name="experienceEmployer" defaultValue={provider?.experienceEmployer} />
              <Field label="Poste" name="experiencePosition" defaultValue={provider?.experiencePosition} />
              <Field label="Durée" name="experienceDuration" defaultValue={provider?.experienceDuration} />
              <Field label="Contact Employeur" name="experienceContact" defaultValue={provider?.experienceContact} />
           </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold mb-4 border-b pb-2">5. Disponibilité</h3>
           <div className="grid gap-4 md:grid-cols-2">
             <Field label="Horaires souhaités (Disponibilité)" name="availability" placeholder="Temps plein / partiel / nuit / urgence" defaultValue={provider?.availability} />
             <Field label="Zone de travail souhaitée" name="workZone" placeholder="Conakry, Banlieue, Autres..." defaultValue={provider?.workZone} />
           </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold mb-4 border-b pb-2">6. Personne Garante</h3>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Field label="Nom et prénom" name="guarantorName" defaultValue={provider?.guarantorName} />
              <Field label="Lien avec vous" name="guarantorRelation" defaultValue={provider?.guarantorRelation} />
              <Field label="Téléphone" name="guarantorPhone" defaultValue={provider?.guarantorPhone} />
              <Field label="Adresse" name="guarantorAddress" defaultValue={provider?.guarantorAddress} />
              <SelectField label="Copie pièce garantie jointe" name="guarantorHasIdCopy" defaultValue={provider?.guarantorHasIdCopy ? "true" : "false"} options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" }
              ]} />
           </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold mb-4 border-b pb-2">7. Partie Réservée à KAGROM</h3>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SelectField label="Entretien effectué (Avis)" name="interviewFavorable" defaultValue={provider?.interviewFavorable === true ? "true" : provider?.interviewFavorable === false ? "false" : ""} options={[
                { value: "true", label: "Favorable" },
                { value: "false", label: "À surveiller / Refusé" }
              ]} />
              <SelectField label="Dossier complet" name="fileComplete" defaultValue={provider?.fileComplete ? "true" : "false"} options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" }
              ]} />
              <TextArea label="Observations" name="notes" placeholder={provider?.notes} />
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <SubmitButton label={isEdit ? "Enregistrer les modifications" : "Ajouter le personnel"} />
        </div>
      </form>
    </Modal>
  );
}

export function ServiceMissionModal({ 
  mission, 
  providers,
  learners,
  isOpen, 
  onClose 
}: { 
  mission?: any, 
  providers: any[],
  learners: any[],
  isOpen: boolean, 
  onClose: () => void 
}) {
  const isEdit = !!mission;
  // const action = isEdit ? updateMissionAction.bind(null, mission.id) : createMissionAction;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Modifier Fiche Partenaire" : "Nouvelle Fiche Partenaire"}>
      <form action={async (data) => { 
        try {
          // await action(data); 
          toast.success(isEdit ? "Mission modifiée avec succès" : "Mission créée avec succès");
          onClose(); 
        } catch (error) {
          toast.error("Erreur lors de l'enregistrement");
        }
      }} className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informations du Partenaire (Client)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom et Prénom" name="clientName" defaultValue={mission?.clientName} required />
            <Field label="Adresse complète" name="location" defaultValue={mission?.location} required />
            <Field label="Quartier / Commune" name="clientDistrict" defaultValue={mission?.clientDistrict} />
            <Field label="Téléphone principal" name="clientPhone" defaultValue={mission?.clientPhone} />
            <Field label="Téléphone secondaire" name="clientSecondaryPhone" defaultValue={mission?.clientSecondaryPhone} />
            <Field label="Email" name="clientEmail" type="email" defaultValue={mission?.clientEmail} />
            <Field label="Profession" name="clientProfession" defaultValue={mission?.clientProfession} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Détails de la Mission</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SelectField label="Service Demandé" name="serviceType" defaultValue={mission?.serviceType} required options={serviceOptions} />
            <Field label="Nombre de personnes (foyer/entreprise)" name="numberOfPeople" defaultValue={mission?.numberOfPeople} />
            <Field label="Horaires souhaités" name="schedule" defaultValue={mission?.schedule} placeholder="Temps plein / partiel / jour" />
            <Field label="Date de début" name="startDate" type="date" defaultValue={mission?.startDate ? new Date(mission.startDate).toISOString().split('T')[0] : ""} required />
            <Field label="Date de fin (optionnel)" name="endDate" type="date" defaultValue={mission?.endDate ? new Date(mission.endDate).toISOString().split('T')[0] : ""} />
            <Field label="Montant du contrat" name="amount" type="number" defaultValue={mission?.amount} required />
          </div>
          <div className="mt-4">
             <TextArea label="Tâches spécifiques" name="details" placeholder={mission?.details} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Affectation (Gestion Interne)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Prestataire Assigné"
              name="providerId"
              defaultValue={mission?.providerId}
              options={providers.map((p) => ({ value: p.id, label: p.fullName }))}
            />
            <SelectField
              label="Apprenant rattaché (optionnel)"
              name="learnerId"
              defaultValue={mission?.learnerId}
              options={learners.map((l) => ({ value: l.id, label: `${l.firstName} ${l.lastName}` }))}
            />
            <SelectField
              label="Statut de la mission"
              name="status"
              defaultValue={mission?.status || "ASSIGNED"}
              options={[
                { value: "DRAFT", label: "Brouillon" },
                { value: "ASSIGNED", label: "Assignée" },
                { value: "IN_PROGRESS", label: "En cours" },
                { value: "COMPLETED", label: "Terminée" },
                { value: "CANCELLED", label: "Annulée" },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <SubmitButton label={isEdit ? "Enregistrer les modifications" : "Créer le contrat"} />
        </div>
      </form>
    </Modal>
  );
}

export function PrintPersonnelButton({ providerId }: { providerId: string }) {
  return (
    <ActionButton 
      label="Imprimer Fiche" 
      variant="secondary" 
      onClick={() => window.open(`/dashboard/prestations/print-personnel/${providerId}`, '_blank')} 
    />
  );
}

export function PrintMissionButton({ missionId }: { missionId: string }) {
  return (
    <ActionButton 
      label="Imprimer Fiche" 
      variant="secondary" 
      onClick={() => window.open(`/dashboard/prestations/print-partenaire/${missionId}`, '_blank')} 
    />
  );
}
