"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ComputedTransaction, Transaction } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";

interface AllTransactionsTableProps {
  computed: ComputedTransaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function AllTransactionsTable({
  computed,
  onEdit,
  onDelete,
}: AllTransactionsTableProps) {
  if (computed.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">No transactions yet</p>
        <p className="text-sm">Start by recording a purchase transaction</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">
              Unit Price ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">
              Total Amount ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">
              Total Cost ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">Avg Cost ({CURRENCY})</TableHead>
            <TableHead className="text-right">Qty on Hand</TableHead>
            <TableHead className="text-right">
              Value on Hand ({CURRENCY})
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {computed.map((row) => {
            const isPurchase = row.transaction.type === "purchase";
            return (
              <TableRow key={row.transaction.id}>
                <TableCell className="font-medium">
                  {row.transaction.date}
                </TableCell>
                <TableCell>
                  <Badge variant={isPurchase ? "default" : "secondary"}>
                    {isPurchase ? "Purchase" : "Sale"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-xs">
                    {row.transaction.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isPurchase ? "+" : "-"}
                  {row.transaction.quantity}
                </TableCell>
                <TableCell className="text-right">
                  {row.transaction.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {isPurchase ? "—" : row.totalCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.averageCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.quantityOnHand}
                </TableCell>
                <TableCell className="text-right">
                  {row.valueOnHand.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(row.transaction)}
                      aria-label="Edit transaction"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => onDelete(row.transaction)}
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
