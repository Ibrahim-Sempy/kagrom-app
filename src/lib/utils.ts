import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}

export function decimalToNumber(value: any) {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function nextCode(prefix: string) {
  const stamp = Date.now().toString().slice(-8);
  const salt = Math.floor(Math.random() * 9000 + 1000);

  return `${prefix}-${stamp}-${salt}`;
}
