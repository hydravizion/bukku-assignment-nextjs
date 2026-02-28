import { describe, it, expect } from "vitest";
import {
  purchaseSchema,
  saleSchema,
  validateDateConstraints,
} from "@/lib/validation";

describe("purchaseSchema", () => {
  it("accepts valid data", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 150,
      unitPrice: 2.0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const result = purchaseSchema.safeParse({
      date: "",
      quantity: 10,
      unitPrice: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = purchaseSchema.safeParse({
      date: "01-01-2022",
      quantity: 10,
      unitPrice: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects NaN quantity", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 1.5,
      unitPrice: 2.0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero quantity", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 0,
      unitPrice: 2.0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: -5,
      unitPrice: 2.0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 10,
      unitPrice: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 10,
      unitPrice: -1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects price with > 2 decimal places", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 10,
      unitPrice: 1.555,
    });
    expect(result.success).toBe(false);
  });

  it("accepts price with exactly 2 decimal places", () => {
    const result = purchaseSchema.safeParse({
      date: "2022-01-01",
      quantity: 10,
      unitPrice: 1.55,
    });
    expect(result.success).toBe(true);
  });
});

describe("saleSchema", () => {
  it("accepts valid data", () => {
    const result = saleSchema.safeParse({
      date: "2022-01-07",
      quantity: 5,
      unitPrice: 3.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date", () => {
    const result = saleSchema.safeParse({
      date: "not-a-date",
      quantity: 5,
      unitPrice: 3.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("validateDateConstraints", () => {
  const existingDates = ["2022-01-01", "2022-01-05", "2022-01-07"];

  it("returns null for a new unique date", () => {
    expect(validateDateConstraints("2022-01-10", existingDates)).toBeNull();
  });

  it("returns error for duplicate date", () => {
    const err = validateDateConstraints("2022-01-05", existingDates);
    expect(err).toContain("already exists");
  });

  it("allows the same date when editing (excludeDate)", () => {
    const err = validateDateConstraints(
      "2022-01-05",
      existingDates,
      "2022-01-05"
    );
    expect(err).toBeNull();
  });

  it("still rejects duplicate when editing to another existing date", () => {
    const err = validateDateConstraints(
      "2022-01-01",
      existingDates,
      "2022-01-05"
    );
    expect(err).toContain("already exists");
  });
});
