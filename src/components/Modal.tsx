"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "rounded-[30px] border border-[color:var(--stroke)] bg-white p-6 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      )}
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display text-2xl font-semibold text-[color:var(--foreground)]">{title}</h2>
        <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full font-bold">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
