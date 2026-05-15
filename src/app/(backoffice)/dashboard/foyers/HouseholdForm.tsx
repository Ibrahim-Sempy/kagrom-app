"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { createHouseholdAction } from "@/app/actions";
import { Field, Panel, SubmitButton } from "@/components/ui";

export function HouseholdForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Panel
      title="Nouveau Foyer"
      description="Creation d'un dossier foyer avec responsable, telephone, adresse et service souhaite."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex items-center gap-2 rounded-md bg-[color:var(--surface-2)] px-4 py-3 font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--stroke)]"
        >
          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {isOpen ? "Masquer le formulaire" : "Afficher le formulaire"}
        </button>

        {isOpen ? (
          <form action={createHouseholdAction} className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Prenom" name="firstName" required />
            <Field label="Nom" name="lastName" required />
            <Field label="Telephone principal" name="primaryPhone" required />
            <Field label="Telephone secondaire" name="secondaryPhone" />
            <Field label="Adresse" name="address" />
            <Field label="Quartier" name="quartier" />
            <Field label="Email" name="email" />
            <Field label="Profession" name="profession" />
            <div className="lg:col-span-3 flex justify-end pt-2">
              <SubmitButton label="Ajouter le foyer" />
            </div>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}
