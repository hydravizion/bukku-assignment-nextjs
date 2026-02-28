"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Transaction,
  ComputedTransaction,
  InventoryState,
} from "@/lib/types";
import { EMPTY_INVENTORY } from "@/lib/types";
import { recalculate, wouldInventoryGoNegative } from "@/lib/wac-engine";
import {
  loadTransactions,
  saveTransactions,
  clearTransactions,
} from "@/lib/storage";

interface UseTransactionsReturn {
  transactions: Transaction[];
  computed: ComputedTransaction[];
  inventory: InventoryState;
  purchases: ComputedTransaction[];
  sales: ComputedTransaction[];
  isLoaded: boolean;

  addTransaction: (tx: Transaction) => string | null;
  updateTransaction: (updated: Transaction) => string | null;
  deleteTransaction: (id: string) => string | null;
  resetAll: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    setTransactions(loadTransactions());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveTransactions(transactions);
  }, [transactions, isLoaded]);

  const { computed, inventory } = useMemo(
    () =>
      transactions.length > 0
        ? recalculate(transactions)
        : { computed: [], inventory: { ...EMPTY_INVENTORY } },
    [transactions]
  );

  const purchases = useMemo(
    () => computed.filter((c) => c.transaction.type === "purchase"),
    [computed]
  );

  const sales = useMemo(
    () => computed.filter((c) => c.transaction.type === "sale"),
    [computed]
  );

  const addTransaction = useCallback(
    (tx: Transaction): string | null => {
      const next = [...transactions, tx];
      const err = wouldInventoryGoNegative(next);
      if (err) return err;
      setTransactions(next);
      return null;
    },
    [transactions]
  );

  const updateTransaction = useCallback(
    (updated: Transaction): string | null => {
      const next = transactions.map((t) => (t.id === updated.id ? updated : t));
      const err = wouldInventoryGoNegative(next);
      if (err) return err;
      setTransactions(next);
      return null;
    },
    [transactions]
  );

  const deleteTransaction = useCallback(
    (id: string): string | null => {
      const next = transactions.filter((t) => t.id !== id);
      const err = wouldInventoryGoNegative(next);
      if (err) return err;
      setTransactions(next);
      return null;
    },
    [transactions]
  );

  const resetAll = useCallback(() => {
    clearTransactions();
    setTransactions([]);
  }, []);

  return {
    transactions,
    computed,
    inventory,
    purchases,
    sales,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetAll,
  };
}
