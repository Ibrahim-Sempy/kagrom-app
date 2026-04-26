"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

export function DeleteActionButton({
  action,
  id,
  confirmMessage = "Voulez-vous vraiment supprimer cet élément ?"
}: {
  action: (id: string) => Promise<void>;
  id: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(confirmMessage)) {
      startTransition(async () => {
        try {
          await action(id);
          toast.success("Élément supprimé avec succès.");
        } catch (error) {
          toast.error("Erreur lors de la suppression. Il se peut que cet élément soit utilisé ailleurs.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Supprimer"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function EditActionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="p-2 text-[color:var(--brand-green)] hover:bg-[color:var(--brand-green)] hover:text-white rounded transition-colors"
      title="Modifier"
    >
      <Edit className="w-4 h-4" />
    </button>
  );
}
