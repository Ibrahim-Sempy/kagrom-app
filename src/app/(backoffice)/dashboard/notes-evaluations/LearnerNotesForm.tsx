"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { recordResultAction } from "@/app/actions";
import { Panel, SelectField, SubmitButton } from "@/components/ui";
import { calculateAverage, getMentionFromAverage, parseScoreInput } from "./note-utils";

export function LearnerNotesForm({
  enrollments,
  modules,
}: {
  enrollments: Array<{ value: string; label: string }>;
  modules: Array<{ value: string; label: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scoreTheory, setScoreTheory] = useState("");
  const [scorePractical, setScorePractical] = useState("");

  const average = calculateAverage(parseScoreInput(scoreTheory), parseScoreInput(scorePractical));
  const mention = getMentionFromAverage(average);

  const resetFormState = () => {
    formRef.current?.reset();
    setScoreTheory("");
    setScorePractical("");
  };

  const hasOptions = enrollments.length > 0 && modules.length > 0;

  return (
    <Panel
      title="Nouvelle note apprenant"
      description="Selectionnez une inscription et un module puis saisissez les notes. La moyenne et la mention se mettent a jour pendant la saisie."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              resetFormState();
            }
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 rounded-md bg-[color:var(--surface-2)] px-4 py-3 font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--stroke)]"
        >
          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {isOpen ? "Masquer le formulaire" : "Afficher le formulaire"}
        </button>

        {!hasOptions ? (
          <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-4 text-sm text-[color:var(--foreground-muted)]">
            Ajoutez d&apos;abord des inscriptions et des modules pour pouvoir enregistrer des notes.
          </div>
        ) : null}

        {isOpen && hasOptions ? (
          <form
            ref={formRef}
            action={async (formData) => {
              const enrollmentId = formData.get("enrollmentId")?.toString() ?? "";
              const moduleId = formData.get("moduleId")?.toString() ?? "";

              if (!enrollmentId || !moduleId) {
                toast.error("Choisissez une inscription et un module.");
                return;
              }

              try {
                await recordResultAction(formData);
                toast.success("Note apprenant enregistree");
                resetFormState();
                setIsOpen(false);
              } catch {
                toast.error("Erreur lors de l'enregistrement de la note");
              }
            }}
            className="space-y-8 pt-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Inscription apprenant" name="enrollmentId" required options={enrollments} />
              <SelectField label="Module" name="moduleId" required options={modules} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">Note theorique</span>
                <input
                  name="scoreTheory"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={scoreTheory}
                  onChange={(event) => setScoreTheory(event.target.value)}
                  className="h-12 w-full rounded-md border border-[color:var(--stroke)] px-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">Note pratique</span>
                <input
                  name="scorePractical"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={scorePractical}
                  onChange={(event) => setScorePractical(event.target.value)}
                  className="h-12 w-full rounded-md border border-[color:var(--stroke)] px-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)]"
                />
              </label>

              <div className="rounded-md border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">Moyenne</p>
                <p className="mt-2 font-display text-2xl font-semibold text-[color:var(--foreground)]">
                  {average > 0 ? average.toFixed(2) : "-"}
                </p>
              </div>

              <div className="rounded-md border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">Mention</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--brand-green)]">{mention}</p>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Observation</span>
              <textarea
                name="observation"
                rows={4}
                className="w-full rounded-md border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)] focus:bg-white"
              />
            </label>

            <div className="flex justify-end">
              <SubmitButton label="Enregistrer la note" />
            </div>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}
