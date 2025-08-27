# ParityX

SaaS starter for product-based sites with parity-pricing banners, analytics, and subscriptions.

The app lets creators add products, configure country-group discounts, and embed a customizable banner on their sites. Authentication is handled by Clerk, subscriptions by Stripe, and data is stored in Postgres with Drizzle ORM.

## Features

- __Auth & Middleware__: Clerk with route protection via `middleware.ts`.
- __Subscriptions__: Stripe Checkout/Billing Portal flows in `server/actions/stripe.ts`.
- __Database__: Postgres (Neon-ready) using Drizzle ORM and type-safe schema in `drizzle/schema.ts`.
- __Parity Pricing__: Country groups and discounts, with update task in `tasks/updateCountryGroups.ts`.
- __Products__: CRUD server actions in `server/actions/products.ts` and Zod schemas in `schemas/products.ts`.
- __Permissions__: Subscription-tier-based gating in `server/permissions.ts` and `data/SubscriptionTiers.ts`.
- __UI__: Next.js App Router, React Server Components, Tailwind CSS (v4), shadcn/ui, lucide icons, dark mode via `next-themes`.

## Tech Stack

- Next.js 15 (App Router), React 19
- TypeScript
- Tailwind CSS 4, shadcn/ui
- Clerk (Auth)
- Stripe (Billing)
- Drizzle ORM + PostgreSQL (Neon compatible)
- Zod + `@t3-oss/env-nextjs` for runtime-safe envs

## Prerequisites

- Node.js 20+ and pnpm
- A PostgreSQL database (e.g., Neon)
- Stripe account and Stripe CLI (for local webhooks)
- Clerk account

## Getting Started

1) Install dependencies

```bash
pnpm install
```

2) Configure environment variables (see list below). Create a `.env` file at the project root:

```bash
cp .env.example .env   # if you maintain an example file, otherwise create .env manually
```

3) Run database migrations

```bash
pnpm db:generate
pnpm db:migrate
```

4) Seed/refresh country groups (optional but recommended)

```bash
# If your script expects the TS file, run:
pnpm tsx --env-file=.env ./tasks/updateCountryGroups.ts

# Or if you keep a package script (verify the path matches .ts):
pnpm run db:updateCountryGroups
```

5) Start the dev server

```bash
pnpm dev
```

Open http://localhost:3000

## Environment Variables

Validated with `@t3-oss/env-nextjs`. Missing/invalid values will error at runtime.

Server-side (`data/env/server.ts`):

- `DATABASE_URL` (Postgres connection string)
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_PLAN_STRIPE_PRICE_ID`
- `STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID`
- `STRIPE_PREMIUM_PLAN_STRIPE_PRICE_ID`
- `TEST_COUNTRY_CODE` (used for geolocation/testing flows)

Client-side (`data/env/client.ts`):

- `NEXT_PUBLIC_SERVER_URL` (e.g., http://localhost:3000)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL`

## Database

- Schema is defined in `drizzle/schema.ts` with tables for products, views, countries, country-groups, discounts, and user subscriptions.
- Config in `drizzle.config.ts` uses `DATABASE_URL` and outputs to `drizzle/`.
- Commands:
  - `pnpm db:generate` – generate SQL from schema
  - `pnpm db:migrate` – run migrations
  - `pnpm db:studio` – open Drizzle Studio

## Stripe

Server actions in `server/actions/stripe.ts` implement:

- `createCheckoutSession(tier)` – create a subscription checkout
- `createCustomerPortalSession()` – open Billing Portal
- `createCancelSession()` – guided cancellation flow

Local webhook forwarding (requires Stripe CLI and `STRIPE_WEBHOOK_SECRET` set):

```bash
pnpm stripe:webhooks
```

## Authentication (Clerk)

- `middleware.ts` protects all non-public routes. Public routes include `/`, `/sign-in`, `/sign-up`, and `/api/*`.
- Ensure Clerk keys are set in `.env` and that publishable key is exposed via `NEXT_PUBLIC_*` vars.

## Scripts

From `package.json`:

- `dev` – Next dev server (Turbopack)
- `build` – Next build
- `start` – Next start
- `lint` – Next lint
- `db:generate` / `db:migrate` / `db:studio`
- `db:updateCountryGroups` – runs the country group updater (verify it points to `.ts` file)
- `stripe:webhooks` – forward Stripe webhooks to `/api/webhooks/stripe`

## Project Structure

- `app/` – routes, layouts, RSC pages (auth, marketing, dashboard, api)
- `components/` – shadcn/ui components and shared UI
- `data/` – environment validators and tier data
- `drizzle/` – migrations and generated artifacts
- `server/` – server actions and DB access (products, subscriptions, views)
- `schemas/` – Zod schemas for forms and server actions
- `lib/` – utilities (formatters, cache, helpers)
- `tasks/` – maintenance scripts (e.g., country group updater)

## Deployment

- Works well on Vercel. Ensure all env vars are configured in the hosting platform.
- Set `NEXT_PUBLIC_SERVER_URL` to the deployed URL.
- Configure Stripe webhooks in production and update `STRIPE_WEBHOOK_SECRET`.

## Troubleshooting

- __Env validation errors__: Ensure all required `.env` keys are present and correctly typed (URLs must be valid URLs).
- __Country update script doesn’t run__: Check that the script path matches the actual file extension (`.ts` vs `.js`).
- __Auth redirect issues__: Verify `NEXT_PUBLIC_CLERK_*` URLs and middleware public routes.

---

Maintained with Next.js 15, React 19, and Tailwind CSS 4.
