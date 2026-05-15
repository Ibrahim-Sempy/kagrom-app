"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createAssignmentAction } from "@/app/actions";
import { Field, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";

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
                  <p className="text-xs leading-5 text-[color:var(--foreground-muted)]">
                    {option.description || "Cliquez pour activer cette option."}
                  </p>
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

export function AssignmentForm({
  employees,
  households,
  services,
  availabilities,
}: {
  employees: Array<{ value: string; label: string }>;
  households: Array<{ value: string; label: string }>;
  services: OptionItem[];
  availabilities: OptionItem[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Terminee" },
    { value: "CANCELLED", label: "Annulee" },
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

  const resetFormState = () => {
    formRef.current?.reset();
    setSelectedServices([]);
    setSelectedAvailabilities([]);
    setServiceError(null);
    setAvailabilityError(null);
  };

  const handleToggleForm = () => {
    if (isOpen) {
      resetFormState();
    }

    setIsOpen(!isOpen);
  };

  return (
    <Panel
      title="Nouvelle Affectation"
      description="Formulaire conforme au modele Assignment avec employe, foyer, montant par mois, statut, services, horaire et details de mission."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleToggleForm}
          className="flex items-center gap-2 rounded-md bg-[color:var(--surface-2)] px-4 py-3 font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--stroke)]"
        >
          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {isOpen ? "Masquer le formulaire" : "Afficher le formulaire"}
        </button>

        {isOpen ? (
          <form
            ref={formRef}
            action={async (formData) => {
              const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);
              const horaireIds = formData.getAll("horaireIds").map(String).filter(Boolean);

              if (!serviceIds.length) {
                setServiceError("Choisissez au moins un service.");
                toast.error("Choisissez au moins un service.");
                return;
              }

              if (!horaireIds.length) {
                setAvailabilityError("Choisissez au moins un horaire.");
                toast.error("Choisissez au moins un horaire.");
                return;
              }

              try {
                setServiceError(null);
                setAvailabilityError(null);
                await createAssignmentAction(formData);
                toast.success("Affectation enregistree avec succes");
                resetFormState();
                setIsOpen(false);
              } catch {
                toast.error("Erreur lors de l'enregistrement de l'affectation");
              }
            }}
            className="space-y-8 pt-4"
          >
            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">1. Identification de l&apos;affectation</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SelectField label="Employe" name="employeeId" required options={employees} />
                <SelectField label="Foyer" name="householdId" required options={households} />
                <Field label="Montant par mois (GNF)" name="monthlyAmount" type="number" required placeholder="Ex: 1500000" />
                <Field label="Date de debut" name="startDate" type="date" required />
                <Field label="Nombre de personnes" name="numberPerson" type="number" required />
                <SelectField label="Statut" name="status" required defaultValue="ACTIVE" options={statusOptions} />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">2. Services et horaire</h3>
              <div className="space-y-4">
                <CheckboxGroup
                  title="Services associes"
                  hint="Cochez un ou plusieurs services relies a cette affectation."
                  name="serviceIds"
                  options={services}
                  selectedValues={selectedServices}
                  onToggle={(value) => {
                    setServiceError(null);
                    toggleSelection(value, setSelectedServices);
                  }}
                  error={serviceError}
                />

                <CheckboxGroup
                  title="Horaire"
                  hint="Selectionnez les disponibilites ou creneaux applicables a cette mission."
                  name="horaireIds"
                  options={availabilities}
                  selectedValues={selectedAvailabilities}
                  onToggle={(value) => {
                    setAvailabilityError(null);
                    toggleSelection(value, setSelectedAvailabilities);
                  }}
                  error={availabilityError}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold">3. Notes</h3>
              <TextArea label="Observations" name="notes" placeholder="Precisez les attentes du foyer, les contraintes ou remarques utiles." />
            </div>

            <div className="flex justify-end pt-4">
              <SubmitButton label="Creer l'affectation" />
            </div>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}
