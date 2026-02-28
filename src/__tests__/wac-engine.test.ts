import { describe, it, expect } from "vitest";
import {
  recalculate,
  roundMoney,
  getAvailableQuantityAtDate,
  wouldInventoryGoNegative,
} from "@/lib/wac-engine";
import type { Transaction } from "@/lib/types";

describe("roundMoney", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundMoney(1.96875)).toBe(1.97);
    expect(roundMoney(2.0)).toBe(2);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(315 / 160)).toBe(1.97);
    expect(roundMoney(1.005)).toBe(1);
  });
});

describe("example scenario", () => {
  /**
   * Reproduces the exact scenario from the problem statement:
   *   01/01/2022: Buy  150 @ RM2.00   → qty 150, value 300.00, avg 2.00
   *   05/01/2022: Buy   10 @ RM1.50   → qty 160, value 315.00, avg 1.97
   *   07/01/2022: Sell   5 @ any      → cost 1.97×5 = 9.85, qty 155, value 305.15
   */
  const txns: Transaction[] = [
    {
      id: "1",
      type: "purchase",
      date: "2022-01-01",
      quantity: 150,
      unitPrice: 2.0,
    },
    {
      id: "2",
      type: "purchase",
      date: "2022-01-05",
      quantity: 10,
      unitPrice: 1.5,
    },
    { id: "3", type: "sale", date: "2022-01-07", quantity: 5, unitPrice: 3.0 },
  ];

  it("computes correctly after first purchase", () => {
    const { computed } = recalculate(txns);
    const first = computed[0];
    expect(first.quantityOnHand).toBe(150);
    expect(first.valueOnHand).toBe(300);
    expect(first.averageCost).toBe(2);
  });

  it("computes correctly after second purchase", () => {
    const { computed } = recalculate(txns);
    const second = computed[1];
    expect(second.quantityOnHand).toBe(160);
    expect(second.valueOnHand).toBe(315);
    expect(second.averageCost).toBe(1.97);
  });

  it("computes sale cost using WAC", () => {
    const { computed } = recalculate(txns);
    const sale = computed[2];
    expect(sale.totalCost).toBe(9.85);
    expect(sale.quantityOnHand).toBe(155);
    expect(sale.valueOnHand).toBe(305.15);
  });

  it("returns final inventory state", () => {
    const { inventory } = recalculate(txns);
    expect(inventory.quantityOnHand).toBe(155);
    expect(inventory.valueOnHand).toBe(305.15);
    expect(inventory.averageCost).toBe(1.97);
  });
});

describe("sorts transactions automatically", () => {
  it("handles random date order input", () => {
    const txns: Transaction[] = [
      {
        id: "3",
        type: "sale",
        date: "2022-01-07",
        quantity: 5,
        unitPrice: 3.0,
      },
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 150,
        unitPrice: 2.0,
      },
      {
        id: "2",
        type: "purchase",
        date: "2022-01-05",
        quantity: 10,
        unitPrice: 1.5,
      },
    ];
    const { inventory } = recalculate(txns);
    expect(inventory.quantityOnHand).toBe(155);
    expect(inventory.valueOnHand).toBe(305.15);
  });
});

describe("empty list", () => {
  it("returns zero inventory", () => {
    const { computed, inventory } = recalculate([]);
    expect(computed).toHaveLength(0);
    expect(inventory.quantityOnHand).toBe(0);
    expect(inventory.valueOnHand).toBe(0);
    expect(inventory.averageCost).toBe(0);
  });
});

describe("sell all inventory", () => {
  it("check zero inventory with correct flow", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 10,
        unitPrice: 5.0,
      },
      {
        id: "2",
        type: "sale",
        date: "2022-01-02",
        quantity: 10,
        unitPrice: 8.0,
      },
    ];
    const { inventory } = recalculate(txns);
    expect(inventory.quantityOnHand).toBe(0);
    expect(inventory.valueOnHand).toBe(0);
    expect(inventory.averageCost).toBe(0);
  });
});

describe("multiple buys and sells", () => {
  it("maintains accurate running WAC across mixed transactions", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 100,
        unitPrice: 10.0,
      },
      {
        id: "2",
        type: "sale",
        date: "2022-01-02",
        quantity: 30,
        unitPrice: 15.0,
      },
      {
        id: "3",
        type: "purchase",
        date: "2022-01-03",
        quantity: 50,
        unitPrice: 12.0,
      },
      {
        id: "4",
        type: "sale",
        date: "2022-01-04",
        quantity: 40,
        unitPrice: 18.0,
      },
    ];
    const { computed, inventory } = recalculate(txns);

    // After buy 100 @ 10: qty=100, value=1000, avg=10
    expect(computed[0].averageCost).toBe(10);

    // After sell 30: cost=10×30=300, value=700, qty=70, avg=10
    expect(computed[1].totalCost).toBe(300);
    expect(computed[1].quantityOnHand).toBe(70);

    // After buy 50 @ 12: value=700+600=1300, qty=120, avg=10.83
    expect(computed[2].quantityOnHand).toBe(120);
    expect(computed[2].averageCost).toBe(10.83);

    // After sell 40: cost=10.83×40=433.20, value=1300-433.20=866.80, qty=80
    expect(computed[3].totalCost).toBe(433.2);
    expect(inventory.quantityOnHand).toBe(80);
    expect(inventory.valueOnHand).toBe(866.8);
  });
});

describe("getAvailableQuantityAtDate", () => {
  const txns: Transaction[] = [
    {
      id: "1",
      type: "purchase",
      date: "2022-01-01",
      quantity: 100,
      unitPrice: 10,
    },
    { id: "2", type: "sale", date: "2022-01-05", quantity: 30, unitPrice: 15 },
  ];

  it("returns purchased quantity before any sale", () => {
    expect(getAvailableQuantityAtDate(txns, "2022-01-03")).toBe(100);
  });

  it("returns nett quantity after sale", () => {
    expect(getAvailableQuantityAtDate(txns, "2022-01-10")).toBe(70);
  });

  it("excludes a specific transaction for edit validation", () => {
    expect(getAvailableQuantityAtDate(txns, "2022-01-10", "2")).toBe(100);
  });
});

describe("wouldInventoryGoNegative", () => {
  it("returns null for valid transaction set", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 100,
        unitPrice: 10,
      },
      {
        id: "2",
        type: "sale",
        date: "2022-01-05",
        quantity: 50,
        unitPrice: 15,
      },
    ];
    expect(wouldInventoryGoNegative(txns)).toBeNull();
  });

  it("returns error message when inventory goes negative", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 10,
        unitPrice: 10,
      },
      {
        id: "2",
        type: "sale",
        date: "2022-01-05",
        quantity: 50,
        unitPrice: 15,
      },
    ];
    expect(wouldInventoryGoNegative(txns)).toContain("negative");
  });

  it("checks mid-timeline negative from random date order insert", () => {
    const txns: Transaction[] = [
      {
        id: "1",
        type: "purchase",
        date: "2022-01-01",
        quantity: 100,
        unitPrice: 10,
      },
      {
        id: "2",
        type: "sale",
        date: "2022-01-03",
        quantity: 80,
        unitPrice: 15,
      },
      {
        id: "3",
        type: "sale",
        date: "2022-01-02",
        quantity: 30,
        unitPrice: 12,
      },
    ];
    expect(wouldInventoryGoNegative(txns)).toContain("negative");
  });
});
