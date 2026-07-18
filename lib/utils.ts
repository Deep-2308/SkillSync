import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names while resolving Tailwind conflicts.
 * `clsx` handles conditionals/arrays; `twMerge` dedupes clashing utilities
 * (e.g. `px-2 px-4` -> `px-4`). This is the standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency (e.g. 1200 -> "$1,200.00"). */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Format a date as a human-readable string (e.g. "Jul 12, 2026"). */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Turn an arbitrary string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a full URL from a path using the public app URL (safe on client & server). */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Derive initials from a name for avatar fallbacks (e.g. "Ada Lovelace" -> "AL"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
