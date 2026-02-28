# WAC Inventory Tracker

Frontend assignment implementation for tracking single-product purchase and sales transactions using the **Weighted Average Cost (WAC)** method.

## Live URL

https://shabil-bukku-assignment-nextjs.vercel.app

## Tech Stack

| Layer         | Technology                  |
| ------------- | --------------------------- |
| Framework     | Next.js 16.1.6 (App Router) |
| Language      | TypeScript (strict mode)    |
| UI Components | shadcn/ui (New York style)  |
| Styling       | Tailwind CSS v4             |
| Validation    | Zod v4                      |
| Testing       | Vitest                      |
| Persistence   | localStorage                |
| Dev Server    | Turbopack                   |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone <repo-url>
cd bukku-assignment-nextjs
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Tests

```bash
npm run test          # single run
npm run test:watch    # watch mode
```

## Features

### Core Requirements

- **Record new purchase transactions** — date, quantity, and unit price with real-time total preview.
- **List purchase transactions** — shows date, transaction ID, quantity, unit price, total amount, running average cost, quantity on hand, and value on hand.
- **Record new sales transactions** — date, quantity, and selling price with total preview.
- **List sales transactions** — shows date, transaction ID, quantity, sales price per unit, total amount, total cost (WAC-based), average cost, and quantity on hand.
- **Inventory summary cards** — quantity on hand, total value, average cost per unit, and total transaction count.
- **Date-based calendar picker** for selecting transaction dates.

### Constraints Implemented

- Single product only (as specified).
- One transaction per date (either purchase OR sale).
- Transactions persist in `localStorage` across sessions.
- Sale quantity cannot exceed current inventory at the point of sale.

### Bonus Features

1. **Random date order insertion** — Transactions can be created in any date order. The WAC engine automatically sorts by date and recalculates all costs from scratch. Insert a purchase backdated before existing sales, and all downstream costs adjust accordingly.

2. **Edit transactions** — Click the pencil icon on any row to update date, quantity, or price. The system validates the change won't cause negative inventory at any point in the timeline before applying it.

3. **Delete transactions** — Click the trash icon to remove a transaction. A confirmation dialog warns that costs will be recalculated. Deletion is blocked if it would cause inventory to go negative for any subsequent transaction.

4. **Reset all** — A guarded "Reset All" button clears all data and starts fresh.

## Architecture

```
src/
├── app/
│   ├── globals.css          # Tailwind v4 + shadcn theme
│   ├── layout.tsx           # Root layout with Sonner toaster
│   └── page.tsx             # Home page (server component)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── dashboard.tsx        # Main client-side orchestrator
│   ├── inventory-summary.tsx
│   ├── purchase-form.tsx
│   ├── sales-form.tsx
│   ├── purchase-table.tsx
│   ├── sales-table.tsx
│   ├── all-transactions-table.tsx
│   ├── edit-transaction-dialog.tsx
│   ├── delete-transaction-dialog.tsx
│   └── date-picker.tsx
├── hooks/
│   └── use-transactions.ts  # Central state management hook
├── lib/
│   ├── types.ts             # Domain types (Transaction, InventoryState, etc.)
│   ├── constants.ts         # App-wide constants
│   ├── wac-engine.ts        # Pure WAC calculation functions
│   ├── validation.ts        # Zod schemas + date constraint checks
│   ├── storage.ts           # localStorage persistence with corruption handling
│   └── utils.ts             # Tailwind merge utility (shadcn)
└── __tests__/
    ├── wac-engine.test.ts   # 15 tests — WAC calculations, sorting, edge cases
    ├── validation.test.ts   # 16 tests — schema + date constraint validation
    └── storage.test.ts      # 6 tests — localStorage load/save/clear/corruption
```

### WAC Calculation Logic

The engine in `src/lib/wac-engine.ts` replays every transaction in chronological order:

1. **Purchase**: Add `quantity × unitPrice` to inventory value, add quantity to stock, recompute average.
2. **Sale**: Use current WAC to compute cost (`averageCost × quantity`), subtract from value and quantity.

All money values are rounded to 2 decimal places using `Number.toFixed(2)`.

The `recalculate()` function always sorts inputs by date before processing, which naturally supports the bonus requirement of random-order insertion — callers simply pass the full transaction list and receive correct results.

### Validation Rules

| Rule                                              | Where Enforced                 |
| ------------------------------------------------- | ------------------------------ |
| Date is required and valid ISO format             | Zod schema                     |
| Quantity is a positive integer                    | Zod schema                     |
| Unit price is positive, max 2 decimal places      | Zod schema                     |
| Only one transaction per date                     | `validateDateConstraints()`    |
| Sale quantity ≤ available inventory at that date  | `getAvailableQuantityAtDate()` |
| No negative inventory at any point after mutation | `wouldInventoryGoNegative()`   |

### Assumptions

- Currency is RM (Malaysian Ringgit), non-configurable.
- WAC is rounded to 2 decimal places per operation (not carried at full precision).
- Transaction IDs are generated using `crypto.randomUUID()`.
- The truncated 8-character ID shown in tables is for display only; the full UUID is stored.
- "One transaction per date" means the ISO date string (`YYYY-MM-DD`) must be unique.

## Test Coverage

**37 tests across 3 suites:**

- **WAC Engine** (15 tests): Assignment example scenario, automatic date sorting, empty inventory, sell-all, multi-step buy/sell sequences, available quantity queries, and negative inventory detection.
- **Validation** (16 tests): Schema acceptance/rejection for dates, quantities, prices, decimal precision, and date constraint logic including edit-mode exclusion.
- **Storage** (6 tests): Load/save/clear operations, malformed data filtering, and corrupt JSON recovery.

## Navigating the Application

1. **Dashboard** — The landing page shows inventory summary cards at the top.
2. **Purchase Form** (left card) — Fill in date, quantity, and unit price, then click "Record Purchase".
3. **Sales Form** (right card) — Fill in date, quantity, and selling price, then click "Record Sale".
4. **Transaction Tabs** — Switch between "All", "Purchases", and "Sales" views below the forms.
5. **Edit/Delete** — Use the action icons on each table row to modify or remove transactions.
6. **Reset** — Use the "Reset All" button to clear all data.
