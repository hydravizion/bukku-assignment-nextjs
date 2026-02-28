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

interface SalesTableProps {
  sales: ComputedTransaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function SalesTable({ sales, onEdit, onDelete }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">No sales yet</p>
        <p className="text-sm">Record your first sale after adding inventory</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">
              Sales Price / Unit ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">
              Total Amount ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">
              Total Cost ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">
              Nett Earnings ({CURRENCY})
            </TableHead>
            <TableHead className="text-right">Avg Cost ({CURRENCY})</TableHead>
            <TableHead className="text-right">Qty on Hand</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((row) => {
            const profit = row.totalAmount - row.totalCost;
            return (
              <TableRow key={row.transaction.id}>
                <TableCell className="font-medium">
                  {row.transaction.date}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {row.transaction.id.slice(0, 8)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {row.transaction.quantity}
                </TableCell>
                <TableCell className="text-right">
                  {row.transaction.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      profit >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"
                    }
                  >
                    {profit.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {row.averageCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.quantityOnHand}
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
