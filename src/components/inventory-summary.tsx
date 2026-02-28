"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryState } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";

interface InventorySummaryProps {
  inventory: InventoryState;
  totalTransactions: number;
}

export function InventorySummary({
  inventory,
  totalTransactions,
}: InventorySummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Quantity on Hand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{inventory.quantityOnHand}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Value on Hand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {CURRENCY} {inventory.valueOnHand.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Average Cost / Unit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {CURRENCY} {inventory.averageCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Total Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalTransactions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
