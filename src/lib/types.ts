/**
 * Core domain types for the WAC Inventory Tracker.
 *
 * Design decision: purchase and sale share a discriminated-union so the WAC
 * engine can iterate a single sorted array while retaining type narrowing.
 */

export type TransactionType = "purchase" | "sale";

export interface PurchaseTransaction {
  id: string;
  type: "purchase";
  /** ISO date string YYYY-MM-DD */
  date: string;
  quantity: number;
  /** Purchase price per unit in RM */
  unitPrice: number;
}

export interface SaleTransaction {
  id: string;
  type: "sale";
  /** ISO date string YYYY-MM-DD */
  date: string;
  quantity: number;
  /** Sales price per unit in RM */
  unitPrice: number;
}

export type Transaction = PurchaseTransaction | SaleTransaction;

/**
 * Enriched transaction produced by the WAC engine.  Every sale carries its
 * computed cost; every row carries the running inventory snapshot.
 */
export interface ComputedTransaction {
  transaction: Transaction;
  /** WAC-based total cost (only meaningful for sales) */
  totalCost: number;
  /** Unit price × quantity */
  totalAmount: number;
  /** Average cost at the moment *after* this transaction was applied */
  averageCost: number;
  /** Quantity on hand *after* this transaction */
  quantityOnHand: number;
  /** Value of inventory on hand *after* this transaction */
  valueOnHand: number;
}

export interface InventoryState {
  quantityOnHand: number;
  valueOnHand: number;
  averageCost: number;
}

export const EMPTY_INVENTORY: InventoryState = {
  quantityOnHand: 0,
  valueOnHand: 0,
  averageCost: 0,
};
