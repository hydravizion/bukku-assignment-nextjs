"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import { saleSchema, validateDateConstraints } from "@/lib/validation";
import { getAvailableQuantityAtDate } from "@/lib/wac-engine";
import type { Transaction, SaleTransaction } from "@/lib/types";
import type { InventoryState } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";
import { toast } from "sonner";

interface SalesFormProps {
  transactions: Transaction[];
  inventory: InventoryState;
  onSubmit: (tx: SaleTransaction) => string | null;
}

export function SalesForm({
  transactions,
  inventory,
  onSubmit,
}: SalesFormProps) {
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingDates = transactions.map((t) => t.date);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = saleSchema.safeParse({
      date,
      quantity: quantity ? Number(quantity) : undefined,
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const dateErr = validateDateConstraints(parsed.data.date, existingDates);
    if (dateErr) {
      setErrors({ date: dateErr });
      return;
    }

    const available = getAvailableQuantityAtDate(
      transactions,
      parsed.data.date
    );
    if (parsed.data.quantity > available) {
      setErrors({
        quantity: `Cannot sell ${parsed.data.quantity} units — only ${available} available on this date`,
      });
      return;
    }

    const tx: SaleTransaction = {
      id: crypto.randomUUID(),
      type: "sale",
      date: parsed.data.date,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice,
    };

    const err = onSubmit(tx);
    if (err) {
      toast.error(err);
      return;
    }

    toast.success(
      `Sale recorded: ${tx.quantity} units @ ${CURRENCY} ${tx.unitPrice.toFixed(2)}`
    );
    setDate("");
    setQuantity("");
    setUnitPrice("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sale</CardTitle>
        <CardDescription>
          Record items sold from inventory ({inventory.quantityOnHand} units on
          hand)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sale-date">Date</Label>
            <DatePicker value={date} onChange={setDate} />
            {errors.date && (
              <p className="text-destructive text-sm">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-quantity">Quantity</Label>
            <Input
              id="sale-quantity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-price">
              Selling Price / Unit ({CURRENCY})
            </Label>
            <Input
              id="sale-price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 3.50"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
            {errors.unitPrice && (
              <p className="text-destructive text-sm">{errors.unitPrice}</p>
            )}
          </div>

          {quantity && unitPrice && (
            <div className="bg-muted rounded-md px-4 py-3 text-sm">
              Total Sale Amount:{" "}
              <span className="font-semibold">
                {CURRENCY} {(Number(quantity) * Number(unitPrice)).toFixed(2)}
              </span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={inventory.quantityOnHand === 0}
          >
            Record Sale
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
