"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InventorySummary } from "@/components/inventory-summary";
import { PurchaseForm } from "@/components/purchase-form";
import { SalesForm } from "@/components/sales-form";
import { PurchaseTable } from "@/components/purchase-table";
import { SalesTable } from "@/components/sales-table";
import { AllTransactionsTable } from "@/components/all-transactions-table";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/types";
import { RotateCcw } from "lucide-react";

export function Dashboard() {
  const {
    transactions,
    computed,
    inventory,
    purchases,
    sales,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetAll,
  } = useTransactions();

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  const existingDates = transactions.map((t) => t.date);
  const totalNettEarnings = sales.reduce(
    (sum, row) => sum + (row.totalAmount - row.totalCost),
    0
  );

  return (
    <div className="space-y-6">
      <InventorySummary
        inventory={inventory}
        totalTransactions={transactions.length}
        totalNettEarnings={totalNettEarnings}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PurchaseForm transactions={transactions} onSubmit={addTransaction} />
        <SalesForm
          transactions={transactions}
          inventory={inventory}
          onSubmit={addTransaction}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Transaction Records
        </h2>
        {transactions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all transactions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all purchase and sale records.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetAll}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({computed.length})</TabsTrigger>
          <TabsTrigger value="purchases">
            Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="sales">Sales ({sales.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AllTransactionsTable
            computed={computed}
            onEdit={setEditingTx}
            onDelete={setDeletingTx}
          />
        </TabsContent>

        <TabsContent value="purchases" className="mt-4">
          <PurchaseTable
            purchases={purchases}
            onEdit={setEditingTx}
            onDelete={setDeletingTx}
          />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <SalesTable
            sales={sales}
            onEdit={setEditingTx}
            onDelete={setDeletingTx}
          />
        </TabsContent>
      </Tabs>

      <EditTransactionDialog
        transaction={editingTx}
        existingDates={existingDates}
        onSave={updateTransaction}
        onClose={() => setEditingTx(null)}
      />

      <DeleteTransactionDialog
        transaction={deletingTx}
        onConfirm={deleteTransaction}
        onClose={() => setDeletingTx(null)}
      />
    </div>
  );
}
