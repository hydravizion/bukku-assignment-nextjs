"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Transaction } from "@/lib/types";
import { toast } from "sonner";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  onConfirm: (id: string) => string | null;
  onClose: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  onConfirm,
  onClose,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null;

  const label = transaction.type === "purchase" ? "purchase" : "sale";

  function handleDelete() {
    if (!transaction) return;
    const err = onConfirm(transaction.id);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(
      `${label.charAt(0).toUpperCase() + label.slice(1)} transaction deleted`
    );
    onClose();
  }

  return (
    <AlertDialog
      open={!!transaction}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label} transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {label} on{" "}
            <span className="font-semibold">{transaction.date}</span> (
            {transaction.quantity} units). All subsequent costs will be
            recalculated. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
