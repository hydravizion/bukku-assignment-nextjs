import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Shared base fields for transaction forms. Context-dependent validation
 * (duplicate-date, oversell) is applied at the hook/component level where
 * state is available — keeping schemas reusable.
 */
const baseFields = {
  date: z
    .string()
    .min(1, "Date is required")
    .regex(isoDateRegex, "Date must be in YYYY-MM-DD format")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Date must be a valid calendar date"
    ),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
  unitPrice: z
    .number({ error: "Unit price must be a number" })
    .positive("Unit price must be greater than 0")
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      "Unit price can have at most 2 decimal places"
    ),
};

export const purchaseSchema = z.object({
  ...baseFields,
});

export const saleSchema = z.object({
  ...baseFields,
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;

/**
 * Context-aware validation that runs *after* schema parsing.
 * Returns an error message or null if valid.
 */
export function validateDateConstraints(
  date: string,
  existingDates: string[],
  excludeDate?: string
): string | null {
  const otherDates = excludeDate
    ? existingDates.filter((d) => d !== excludeDate)
    : existingDates;

  if (otherDates.includes(date)) {
    return "A transaction already exists on this date";
  }

  return null;
}
