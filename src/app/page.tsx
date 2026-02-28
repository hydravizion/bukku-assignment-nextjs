import { Dashboard } from "@/components/dashboard";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                WAC Inventory Tracker
              </h1>
              <p className="text-muted-foreground text-sm">
                Weighted Average Cost — Single Product Ledger
              </p>
            </div>
          </div>
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Dashboard />
      </main>

      <footer className="bg-card border-t">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-center text-xs">
            Bukku Coding Assignment — Frontend Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
