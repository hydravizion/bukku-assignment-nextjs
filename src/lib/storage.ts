import type { Transaction } from "./types";
import { STORAGE_KEY } from "./constants";

/**
 * Thin persistence layer over localStorage.
 *
 * Reads are validated at load time (malformed data is discarded rather than
 * crashing the app). This is intentional: the cost of losing corrupt data
 * is low compared to a broken UI.
 */

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTransaction);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function clearTransactions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function isValidTransaction(t: unknown): t is Transaction {
  if (typeof t !== "object" || t === null) return false;
  const obj = t as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    (obj.type === "purchase" || obj.type === "sale") &&
    typeof obj.date === "string" &&
    typeof obj.quantity === "number" &&
    typeof obj.unitPrice === "number"
  );
}
