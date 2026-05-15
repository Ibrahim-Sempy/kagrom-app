"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { recordPaymentAction } from "@/app/actions";
import { Field, Panel, SelectField, SubmitButton } from "@/components/ui";

export function PaymentsForm({
  invoices,
  installments,
  paymentModes,
}: {
  invoices: Array<{ value: string; label: string }>;
  installments: Array<{ value: string; label: string }>;
  paymentModes: Array<{ value: string; label: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const resetFormState = () => {
    formRef.current?.reset();
  };

  return (
    <Panel
      title="Enregistrer un paiement"
      description="Selectionnez une facture, le mode de paiement et laissez la reference etre generee automatiquement via le numero de paiement et le recu."
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

        {!invoices.length ? (
          <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-4 text-sm text-[color:var(--foreground-muted)]">
            Aucune facture disponible pour enregistrer un paiement.
          </div>
        ) : null}

        {isOpen && invoices.length ? (
          <form
            ref={formRef}
            action={async (formData) => {
              const invoiceId = formData.get("invoiceId")?.toString() ?? "";

              if (!invoiceId) {
                toast.error("Choisissez une facture.");
                return;
              }

              try {
                await recordPaymentAction(formData);
                toast.success("Paiement enregistre avec reference auto");
                resetFormState();
                setIsOpen(false);
              } catch {
                toast.error("Erreur lors de l'enregistrement du paiement");
              }
            }}
            className="grid gap-4 pt-4 md:grid-cols-2"
          >
            <SelectField label="Facture" name="invoiceId" required options={invoices} />
            <SelectField label="Tranche" name="installmentId" options={installments} />
            <Field label="Montant (GNF)" name="amount" type="number" required />
            <Field label="Date de paiement" name="paidAt" type="date" required />
            <SelectField label="Mode de paiement" name="paymentModeId" required options={paymentModes} />
            <Field label="Commentaire" name="comment" />
            <div className="md:col-span-2">
              <div className="rounded-md border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-4 text-sm text-[color:var(--foreground-muted)]">
                La reference n&apos;est plus saisie manuellement. Le systeme genere automatiquement un numero de paiement et un numero de recu.
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <SubmitButton label="Enregistrer le paiement" />
            </div>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}
