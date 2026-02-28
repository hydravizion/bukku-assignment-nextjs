import type { Transaction, ComputedTransaction, InventoryState } from "./types";
import { EMPTY_INVENTORY } from "./types";
import { MONEY_PRECISION } from "./constants";

/** Round to the configured decimal precision for money values. */
export function roundMoney(value: number): number {
  return Number(value.toFixed(MONEY_PRECISION));
}

/**
 * Recalculate the full WAC ledger from an ordered list of transactions.
 *
 * The engine replays every transaction in chronological order, computing
 * running averages and per-sale costs.  This approach supports the bonus
 * requirement of inserting / editing / deleting transactions in any date
 * order — callers simply pass the re-sorted list and get correct results.
 *
 * Time complexity: O(n) where n = number of transactions.
 */
export function recalculate(transactions: Transaction[]): {
  computed: ComputedTransaction[];
  inventory: InventoryState;
} {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let quantityOnHand = 0;
  let valueOnHand = 0;

  const computed: ComputedTransaction[] = sorted.map((tx) => {
    if (tx.type === "purchase") {
      const totalAmount = roundMoney(tx.quantity * tx.unitPrice);
      quantityOnHand += tx.quantity;
      valueOnHand = roundMoney(valueOnHand + totalAmount);
      const averageCost =
        quantityOnHand > 0 ? roundMoney(valueOnHand / quantityOnHand) : 0;

      return {
        transaction: tx,
        totalCost: totalAmount,
        totalAmount,
        averageCost,
        quantityOnHand,
        valueOnHand,
      };
    }

    // Sale: cost is based on WAC *before* the sale
    const averageCostBeforeSale =
      quantityOnHand > 0 ? roundMoney(valueOnHand / quantityOnHand) : 0;
    const totalCost = roundMoney(averageCostBeforeSale * tx.quantity);
    const totalAmount = roundMoney(tx.unitPrice * tx.quantity);

    valueOnHand = roundMoney(valueOnHand - totalCost);
    quantityOnHand -= tx.quantity;

    const averageCostAfter =
      quantityOnHand > 0 ? roundMoney(valueOnHand / quantityOnHand) : 0;

    return {
      transaction: tx,
      totalCost,
      totalAmount,
      averageCost: averageCostAfter,
      quantityOnHand,
      valueOnHand,
    };
  });

  const inventory: InventoryState =
    computed.length > 0
      ? {
          quantityOnHand: computed[computed.length - 1].quantityOnHand,
          valueOnHand: computed[computed.length - 1].valueOnHand,
          averageCost: computed[computed.length - 1].averageCost,
        }
      : { ...EMPTY_INVENTORY };

  return { computed, inventory };
}

/**
 * Validate that a proposed sale quantity does not exceed quantity on hand
 * at the point where the sale would occur in the timeline.
 *
 * Works for insertions in any date position (bonus requirement).
 */
export function getAvailableQuantityAtDate(
  transactions: Transaction[],
  date: string,
  excludeId?: string
): number {
  const sorted = [...transactions]
    .filter((t) => (excludeId ? t.id !== excludeId : true))
    .sort((a, b) => a.date.localeCompare(b.date));

  let qty = 0;
  for (const tx of sorted) {
    if (tx.date > date) break;
    qty += tx.type === "purchase" ? tx.quantity : -tx.quantity;
  }
  return qty;
}

/**
 * Check if a transaction list stays valid (no negative inventory at any
 * point) after a hypothetical mutation. Used before confirming edits/deletes.
 */
export function wouldInventoryGoNegative(
  transactions: Transaction[]
): string | null {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let qty = 0;
  for (const tx of sorted) {
    qty += tx.type === "purchase" ? tx.quantity : -tx.quantity;
    if (qty < 0) {
      return `Inventory would go negative (${qty}) after transaction on ${tx.date}`;
    }
  }
  return null;
}
