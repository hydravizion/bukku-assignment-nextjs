import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadTransactions,
  saveTransactions,
  clearTransactions,
} from "@/lib/storage";
import type { Transaction } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/constants";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });
});

describe("loadTransactions", () => {
  it("returns empty array when nothing stored", () => {
    expect(loadTransactions()).toEqual([]);
  });

  it("loads valid transactions", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 10,
        unitPrice: 2,
      },
    ];
    mockStorage[STORAGE_KEY] = JSON.stringify(txns);
    expect(loadTransactions()).toEqual(txns);
  });

  it("filters out malformed entries", () => {
    mockStorage[STORAGE_KEY] = JSON.stringify([
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 10,
        unitPrice: 2,
      },
      { bad: "data" },
      null,
    ]);
    const result = loadTransactions();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty array for corrupt JSON", () => {
    mockStorage[STORAGE_KEY] = "not-json!!!";
    expect(loadTransactions()).toEqual([]);
  });
});

describe("saveTransactions", () => {
  it("persists transactions to localStorage", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 5,
        unitPrice: 1,
      },
    ];
    saveTransactions(txns);
    expect(JSON.parse(mockStorage[STORAGE_KEY])).toEqual(txns);
  });
});

describe("clearTransactions", () => {
  it("removes the storage key", () => {
    mockStorage[STORAGE_KEY] = "[]";
    clearTransactions();
    expect(mockStorage[STORAGE_KEY]).toBeUndefined();
  });
});
