# Inventra

Inventra is a smart inventory and billing web app built for both **households** and **retail/small-shop** use. It lets you track stock, scan barcodes to add or bill items, monitor low-stock alerts, and review sales history — all backed by Supabase.

## Features

- **Two usage modes** — switch between a **Household** module (personal pantry/stock tracking) and a **Retail** module (shop inventory + billing), selectable right after login.
- **Inventory management** — add, edit, and organize items by category, storage location, and supplier; track quantities, cost price, and sell price.
- **Barcode scanning** — scan a product barcode with the device camera to instantly look it up in your inventory, and auto-fill new product details (name, brand, category) via the Open Food Facts API when adding new items.
- **Billing / checkout flow** — build a cart from scanned or searched items, complete a bill, and automatically deduct sold quantities from stock.
- **Billing history** — every completed bill is saved with a snapshot of items, quantities, and totals for later review.
- **Low-stock alerts** — get notified when items fall below their configured threshold.
- **Reports dashboard** — visual summaries of inventory and sales activity.
- **Supplier & location tracking** — organize where items are stored and who they're sourced from.
- **Authentication** — full email/password auth flow (login, register, forgot/reset password) backed by Supabase.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling/UI:** Tailwind CSS, shadcn/ui (Radix primitives), Lucide icons
- **Routing:** React Router
- **State/data:** TanStack Query (React Query), React Context (auth, module, notifications)
- **Backend:** Supabase (Postgres database + auth)
- **Forms/validation:** React Hook Form + Zod
- **Testing:** Vitest, Testing Library, Playwright

## Getting Started

### Prerequisites
- Node.js and npm (or bun)
- A Supabase project (URL + publishable/anon key)

### Setup

```sh
# Clone the repo
git clone <this-repo-url>
cd mobile-app-builder-main

# Install dependencies
npm install

# Configure environment variables
# Create a .env file in the project root with:
# VITE_SUPABASE_PROJECT_ID=your-project-id
# VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# VITE_SUPABASE_URL=your-supabase-url

# Start the dev server
npm run dev
```

### Other useful commands

```sh
npm run build        # production build
npm run lint          # run ESLint
npm run test          # run tests once
npm run test:watch    # run tests in watch mode
```

## Project Structure

```
src/
├── pages/           # Route-level pages (Dashboard, Inventory, Scanner, Billing, Reports, etc.)
├── components/      # Reusable UI components (inventory, scanner, layout, auth, ui primitives)
├── context/         # Auth, Module (household/retail), and Notification providers
├── hooks/           # Data hooks (useItems, useInventory, useBilling, useSuppliers, etc.)
├── integrations/    # Supabase client and generated types
└── lib/             # Utilities and shared helpers
```

## Deployment

The app is a standard Vite React SPA and can be deployed to any static hosting platform (e.g. Vercel). Make sure the Supabase environment variables are configured on the hosting platform, and that your Supabase project's allowed auth redirect URLs include your deployed domain.
