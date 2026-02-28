"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import {
  purchaseSchema,
  saleSchema,
  validateDateConstraints,
} from "@/lib/validation";
import type { Transaction } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";
import { toast } from "sonner";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  existingDates: string[];
  onSave: (updated: Transaction) => string | null;
  onClose: () => void;
}

export function EditTransactionDialog({
  transaction,
  existingDates,
  onSave,
  onClose,
}: EditTransactionDialogProps) {
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date);
      setQuantity(String(transaction.quantity));
      setUnitPrice(String(transaction.unitPrice));
      setErrors({});
    }
  }, [transaction]);

  if (!transaction) return null;

  const schema = transaction.type === "purchase" ? purchaseSchema : saleSchema;
  const label = transaction.type === "purchase" ? "Purchase" : "Sale";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transaction) return;
    setErrors({});

    const parsed = schema.safeParse({
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

    const dateErr = validateDateConstraints(
      parsed.data.date,
      existingDates,
      transaction.date
    );
    if (dateErr) {
      setErrors({ date: dateErr });
      return;
    }

    const updated: Transaction = {
      ...transaction,
      date: parsed.data.date,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice,
    };

    const err = onSave(updated);
    if (err) {
      toast.error(err);
      return;
    }

    toast.success(`${label} transaction updated`);
    onClose();
  }

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {label}</DialogTitle>
          <DialogDescription>
            Update the transaction details. Costs will be recalculated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker value={date} onChange={setDate} />
            {errors.date && (
              <p className="text-destructive text-sm">{errors.date}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Unit Price ({CURRENCY})</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
            {errors.unitPrice && (
              <p className="text-destructive text-sm">{errors.unitPrice}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
