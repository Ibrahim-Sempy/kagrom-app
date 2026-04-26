import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-[color:var(--stroke)] bg-[linear-gradient(120deg,rgba(255,255,255,0.98),rgba(246,240,225,0.95))] px-6 py-6 shadow-[0_24px_60px_rgba(56,91,42,0.08)] lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-gold)]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-[color:var(--foreground)] sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--foreground-muted)]">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone = "green",
}: {
  label: string;
  value: string;
  tone?: "green" | "gold";
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border px-5 py-5 shadow-[0_20px_50px_rgba(56,91,42,0.06)]",
        tone === "green"
          ? "border-[color:var(--stroke)] bg-white"
          : "border-transparent bg-[linear-gradient(140deg,rgba(200,135,42,0.98),rgba(165,107,23,0.95))] text-white",
      )}
    >
      <p className={cn("text-sm", tone === "green" ? "text-[color:var(--foreground-muted)]" : "text-white/75")}>{label}</p>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[30px] border border-[color:var(--stroke)] bg-white p-6 shadow-[0_20px_50px_rgba(56,91,42,0.06)]", className)}>
      <div className="mb-5">
        <h2 className="font-display text-2xl font-semibold text-[color:var(--foreground)]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  accept,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  accept?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        accept={accept}
        className="h-12 w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)] focus:bg-white"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)] focus:bg-white"
      >
        <option value="">Selectionner</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextArea({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      <textarea
        name={name}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)] focus:bg-white"
      />
    </label>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--brand-green)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-green-strong)]"
    >
      {label}
    </button>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[color:var(--stroke)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--stroke)]">
            {rows.map((row, index) => (
              <tr key={index} className="bg-white align-top">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-4 py-4 text-[color:var(--foreground)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
