"use client";

import { useState } from "react";
import { ServiceMissionModal, ServiceProviderModal, PrintMissionButton, PrintPersonnelButton } from "./ClientModals";
import { ActionButton } from "./components";
import { EditActionButton, DeleteActionButton } from "@/components/TableActions";
import { deleteServiceProviderAction, deleteMissionAction } from "@/app/actions";
import { DataTable, Panel } from "@/components/ui";
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/utils";

export function PrestationsClientManager({ providers, missions, learners }: { providers: any[], missions: any[], learners: any[] }) {
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const openProviderModal = (provider?: any) => {
    setSelectedProvider(provider || null);
    setProviderModalOpen(true);
  };

  const openMissionModal = (mission?: any) => {
    setSelectedMission(mission || null);
    setMissionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => openProviderModal()}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--brand-green)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-green-strong)]"
        >
          + Nouvelle Fiche Personnel
        </button>
        <button
          onClick={() => openMissionModal()}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--brand-gold)] px-6 text-sm font-semibold text-white transition hover:bg-[#a56b17]"
        >
          + Nouvelle Fiche Partenaire
        </button>
      </div>

      <ServiceProviderModal
        isOpen={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        provider={selectedProvider}
      />

      <ServiceMissionModal
        isOpen={missionModalOpen}
        onClose={() => setMissionModalOpen(false)}
        mission={selectedMission}
        providers={providers}
        learners={learners}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Base des Prestataires / Personnel" description="Gestion des fiches d'inscription du personnel.">
          <DataTable
            headers={["Personnel", "Poste", "Contact", "Actions"]}
            rows={providers.map((provider) => [
              <div key="provider">
                <p className="font-semibold">{provider.fullName}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{provider.idType ? `${provider.idType}: ${provider.idNumber}` : "Pas de pièce"}</p>
              </div>,
              <div key="role">
                <p>{provider.category}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{provider.availability || "N/A"}</p>
              </div>,
              <div key="contact">
                <p>{provider.phone}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{provider.workZone || "-"}</p>
              </div>,
              <div key="actions" className="flex items-center gap-2">
                <EditActionButton onClick={() => openProviderModal(provider)} />
                <DeleteActionButton action={deleteServiceProviderAction} id={provider.id} />
                <PrintPersonnelButton providerId={provider.id} />
              </div>
            ])}
          />
        </Panel>

        <Panel title="Missions en portefeuille / Partenaires" description="Gestion des contrats de prestation de services.">
          <DataTable
            headers={["Client & Mission", "Affectation", "Période & Montant", "Actions"]}
            rows={missions.map((mission) => {
              const assignment = [mission.provider?.fullName, mission.learner ? `${mission.learner.firstName} ${mission.learner.lastName}` : null]
                .filter(Boolean)
                .join(" / ");

              return [
                <div key="client">
                   <p className="font-semibold">{mission.clientName}</p>
                   <p className="text-xs text-[color:var(--foreground-muted)]">{mission.serviceType} - {mission.location}</p>
                </div>,
                <div key="assignment">
                  <p>{assignment || "À définir"}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">Statut: {mission.status}</p>
                </div>,
                <div key="period">
                  <p>{formatDate(new Date(mission.startDate))}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{formatCurrency(decimalToNumber(mission.amount))}</p>
                </div>,
                <div key="actions" className="flex items-center gap-2">
                  <EditActionButton onClick={() => openMissionModal(mission)} />
                  <DeleteActionButton action={deleteMissionAction} id={mission.id} />
                  <PrintMissionButton missionId={mission.id} />
                </div>
              ];
            })}
          />
        </Panel>
      </div>
    </div>
  );
}
