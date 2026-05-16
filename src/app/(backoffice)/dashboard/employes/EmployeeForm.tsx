"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { createEmployeeAction } from "@/app/actions";
import { Field, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { toast } from "sonner";

type OptionItem = {
  id: string;
  label: string;
  description?: string | null;
};

function CheckboxGroup({
  title,
  hint,
  name,
  options,
  selectedValues,
  onToggle,
  error,
}: {
  title: string;
  hint: string;
  name: string;
  options: OptionItem[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  error?: string | null;
}) {
  return (
    <fieldset className="rounded-md border border-[color:var(--stroke)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(246,240,225,0.55))] p-4 shadow-[0_18px_40px_rgba(56,91,42,0.06)]">
      <div className="flex flex-col gap-2 border-b border-[color:var(--stroke)] pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <legend className="text-sm font-semibold text-[color:var(--foreground)]">{title}</legend>
          <p className="mt-1 text-xs leading-6 text-[color:var(--foreground-muted)]">{hint}</p>
        </div>
        <span className="inline-flex h-8 items-center rounded-full bg-[color:var(--surface-2)] px-3 text-xs font-medium text-[color:var(--foreground-muted)]">
          {selectedValues.length} selection{selectedValues.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const checked = selectedValues.includes(option.id);

          return (
            <label key={option.id} className="relative block cursor-pointer">
              <input
                type="checkbox"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onToggle(option.id)}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />

              <div className="flex h-full min-h-[96px] items-start justify-between gap-3 rounded-md border border-[color:var(--stroke)] bg-white px-4 py-4 transition duration-200 peer-checked:border-[color:var(--brand-green)] peer-checked:bg-[rgba(56,91,42,0.06)] peer-checked:shadow-[0_16px_30px_rgba(56,91,42,0.12)] peer-focus-visible:border-[color:var(--brand-gold)] hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)] hover:shadow-[0_14px_24px_rgba(56,91,42,0.08)]">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{option.label}</p>
                  {option.description ? (
                    <p className="text-xs leading-5 text-[color:var(--foreground-muted)]">{option.description}</p>
                  ) : (
                    <p className="text-xs leading-5 text-[color:var(--foreground-muted)]">
                      Cliquez pour activer cette option.
                    </p>
                  )}
                </div>

                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--stroke)] bg-white transition peer-checked:border-[color:var(--brand-green)] peer-checked:bg-[color:var(--brand-green)]">
                  <span className="h-2 w-2 rounded-full bg-white opacity-0 transition peer-checked:opacity-100" />
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </fieldset>
  );
}

export function EmployeeForm({
  services,
  availabilities,
}: {
  services: OptionItem[];
  availabilities: OptionItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPostes, setSelectedPostes] = useState<string[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [posteError, setPosteError] = useState<string | null>(null);

  const maritalStatusOptions = [
    { value: "SINGLE", label: "Celibataire" },
    { value: "MARRIED", label: "Marie(e)" },
    { value: "DIVORCED", label: "Divorce(e)" },
    { value: "WIDOWED", label: "Veuf/Veuve" },
  ];
  const idTypeOptions = [
    { value: "NATIONAL_ID", label: "Carte d'identite" },
    { value: "PASSPORT", label: "Passeport" },
    { value: "OTHER", label: "Autre" },
  ];

  const toggleSelection = (
    value: string,
    setSelectedValues: Dispatch<SetStateAction<string[]>>,
  ) => {
    setSelectedValues((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    );
  };

  const resetSelections = () => {
    setSelectedPostes([]);
    setSelectedCompetencies([]);
    setSelectedAvailabilities([]);
    setPosteError(null);
  };

  const handleToggleForm = () => {
    if (isOpen) {
      resetSelections();
    }

    setIsOpen(!isOpen);
  };

  return (
    <Panel title="Nouvel Employe" description="Enregistrement d'un employe avec competences, postes demandes et disponibilites.">
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleToggleForm}
          className="flex items-center gap-2 rounded-md bg-[color:var(--surface-2)] px-4 py-3 font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--stroke)]"
        >
          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {isOpen ? "Masquer le formulaire" : "Afficher le formulaire"}
        </button>

        {isOpen && (
          <form
            action={async (data) => {
              const posteIds = data.getAll("posteIds").map(String).filter(Boolean);

              if (!posteIds.length) {
                setPosteError("Choisissez au moins un poste demande.");
                toast.error("Choisissez au moins un poste demande.");
                return;
              }

              try {
                setPosteError(null);
                await createEmployeeAction(data);
                toast.success("Personnel ajoute avec succes");
                resetSelections();
                setIsOpen(false);
              } catch (error) {
                toast.error("Erreur lors de l'enregistrement");
              }
            }}
            className="space-y-8 pt-4"
          >
            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">1. Informations Personnelles</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Prenom" name="firstName" required />
                <Field label="Nom" name="lastName" required />
                <Field label="Date de naissance" name="birthDate" type="date" />
                <Field label="Lieu de naissance" name="birthPlace" />
                <Field label="Nationalite" name="nationality" />
                <SelectField
                  label="Situation matrimoniale"
                  name="matrialStatus"
                  required
                  options={maritalStatusOptions}
                />
                <Field label="Adresse complete" name="address" required />
                <Field label="Telephone principal" name="primaryPhone" required />
                <Field label="Telephone secondaire" name="secondaryPhone" />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">2. Piece d'Identite</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SelectField label="Type de piece" name="typeOfId" required options={idTypeOptions} />
                <Field label="Numero de la piece" name="idNumber" />
                <Field label="Date d'expiration" name="idExpiryDate" type="date" />
                <SelectField
                  label="Copie jointe"
                  name="hasIdCopy"
                  options={[
                    { value: "true", label: "Oui" },
                    { value: "false", label: "Non" },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">3. Postes, Competences et Disponibilites</h3>
              <div className="space-y-4">
                <CheckboxGroup
                  title="Postes demandes"
                  hint="Selectionnez un ou plusieurs services pour lesquels cet employe peut etre positionne."
                  name="posteIds"
                  options={services}
                  selectedValues={selectedPostes}
                  onToggle={(value) => {
                    setPosteError(null);
                    toggleSelection(value, setSelectedPostes);
                  }}
                  error={posteError}
                />

                <CheckboxGroup
                  title="Competences"
                  hint="Choisissez les services deja maitrises par l'employe. Les valeurs sont envoyees via competencyIds."
                  name="competencyIds"
                  options={services}
                  selectedValues={selectedCompetencies}
                  onToggle={(value) => toggleSelection(value, setSelectedCompetencies)}
                />

                <CheckboxGroup
                  title="Disponibilites"
                  hint="Cochez les creneaux ou statuts de disponibilite issus des parametres de l'application."
                  name="availabilityIds"
                  options={availabilities}
                  selectedValues={selectedAvailabilities}
                  onToggle={(value) => toggleSelection(value, setSelectedAvailabilities)}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">4. Personne Garante</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Field label="Prenom du garant" name="guarantorfirstName" />
                <Field label="Nom du garant" name="guarantorLastName" />
                <Field label="Lien avec vous" name="guarantorRelation" />
                <Field label="Telephone" name="guarantorPhone" />
                <Field label="Adresse" name="guarantorAddress" />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">5. Partie Reservee a KAGROM</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  label="Entretien effectue (Avis)"
                  name="avis"
                  options={[
                    { value: "FAVORABLE", label: "Favorable" },
                    { value: "UNFAVORABLE", label: "A surveiller / Refuse" },
                    { value: "MONITOR", label: "A monitorer" },
                  ]}
                />
                <SelectField
                  label="Dossier complet"
                  name="completeFolder"
                  options={[
                    { value: "true", label: "Oui" },
                    { value: "false", label: "Non" },
                  ]}
                />
                <SelectField
                  label="Entretien effectue"
                  name="interviewDone"
                  options={[
                    { value: "true", label: "Oui" },
                    { value: "false", label: "Non" },
                  ]}
                />
              </div>
              <div className="mt-4">
                <TextArea label="Observations" name="observations" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <SubmitButton label="Ajouter le personnel" />
            </div>
          </form>
        )}
      </div>
    </Panel>
  );
}
