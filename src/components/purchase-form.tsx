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
import { purchaseSchema } from "@/lib/validation";
import { validateDateConstraints } from "@/lib/validation";
import type { Transaction, PurchaseTransaction } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";
import { toast } from "sonner";

interface PurchaseFormProps {
  transactions: Transaction[];
  onSubmit: (tx: PurchaseTransaction) => string | null;
}

export function PurchaseForm({ transactions, onSubmit }: PurchaseFormProps) {
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingDates = transactions.map((t) => t.date);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = purchaseSchema.safeParse({
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

    const tx: PurchaseTransaction = {
      id: crypto.randomUUID(),
      type: "purchase",
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
      `Purchase recorded: ${tx.quantity} units @ ${CURRENCY} ${tx.unitPrice.toFixed(2)}`
    );
    setDate("");
    setQuantity("");
    setUnitPrice("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Purchase</CardTitle>
        <CardDescription>Record items purchased for inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purchase-date">Date</Label>
            <DatePicker value={date} onChange={setDate} />
            {errors.date && (
              <p className="text-destructive text-sm">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-quantity">Quantity</Label>
            <Input
              id="purchase-quantity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 150"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-price">Unit Price ({CURRENCY})</Label>
            <Input
              id="purchase-price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 2.00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
            {errors.unitPrice && (
              <p className="text-destructive text-sm">{errors.unitPrice}</p>
            )}
          </div>

          {quantity && unitPrice && (
            <div className="bg-muted rounded-md px-4 py-3 text-sm">
              Total:{" "}
              <span className="font-semibold">
                {CURRENCY} {(Number(quantity) * Number(unitPrice)).toFixed(2)}
              </span>
            </div>
          )}

          <Button type="submit" className="w-full">
            Record Purchase
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
