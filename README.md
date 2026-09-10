# The High Octane Café — Till

Order, billing and sales terminal for The High Octane Café, Pampore.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Before calling any change done:

```bash
npm run typecheck && npm run lint && npm test
```

## What it does

- **Till** (`/`) — tap items, adjust quantities, choose cash/UPI/card, charge and print
- **Sales** (`/sales`) — the day's takings, order history, reprint any bill
- **Receipts** — 80mm thermal, sized at print time (see `src/lib/print.ts`)
- **PIN lock** — a 4-digit gate set on first run

The menu lives in `src/data/menu.ts` and the outlet details in `src/data/outlet.ts`.
Those are the only two files to edit when prices or contact details change.

## Where sales data is stored

The app picks its storage **automatically at startup** by asking `/api/orders`:

|                  | When                      | Data lives in       | Survives                          |
| ---------------- | ------------------------- | ------------------- | --------------------------------- |
| **localStorage** | No Blob store connected   | One browser         | Redeploys, not clearing site data |
| **Vercel Blob**  | A Blob store is connected | A private JSON blob | Everything; shared across devices |

No environment variable to set — connect a Blob store and it switches over.
The till shows a notice on screen when it is running on browser-only storage.

## Connecting a Vercel Blob store

1. Install the CLI and link the project:

   ```bash
   npm i -g vercel
   vercel link
   ```

2. In the Vercel dashboard: **Storage → Create Database → Blob**.

   **Choose `Private` access.** The code reads with `access: 'private'` and
   `useCache: false` so the till never gets a stale order log from the CDN.
   Access mode **cannot be changed after the store is created**, so getting
   this wrong means starting over with a new store.

3. Connect the store to this project (**Projects → Connect to Project**).
   Vercel injects `BLOB_STORE_ID` and authenticates via OIDC — there is no
   long-lived token to manage.

4. For local development against the real store:

   ```bash
   vercel env pull .env.local
   ```

5. Deploy. `/api/orders` starts returning `configured: true` and the app uses
   Blob from then on.

## Read this before deploying

**The `/api/orders` routes are public.** The PIN gate runs in the browser and
protects nothing on the server — anyone who knows the deployment URL can read
and write the sales log directly with `curl`.

Before putting real sales in it, turn on
[Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)
(**Vercel Authentication**, scope **All Deployments**), which is free on Hobby
and covers API routes too.

Also note Vercel's Hobby plan is [non-commercial only](https://vercel.com/docs/limits/fair-use-guidelines).
Testing is fine; running the café's real till on it is not.

## Why a single JSON blob, and what it costs you

The whole order log is one private blob, rewritten on every sale. That is a
deliberate trade-off for a single-till café, and it brings two problems a
database would not:

- **Stale reads** — blobs are CDN-cached and an overwrite takes up to 60s to
  propagate. Every read passes `useCache: false` to go straight to origin.
- **Lost updates** — two concurrent writes would clobber each other, so every
  write uses an `ifMatch` ETag and retries on conflict.

There is also no querying. "Today's total" means downloading every order and
summing in JavaScript. That is fine at café volume and wrong at any real scale.
When this stops being a test, move to a SQL database — only `src/lib/blob.ts`
and `src/lib/ordersBackend.ts` should need to change.

## Layout

```
src/
  app/
    api/orders/        Route handlers backing the Blob store
    sales/             Sales history page
  components/          One component per file
  data/                menu.ts, outlet.ts
  lib/                 Domain logic, storage, printing, auth
```

Path alias: `@/*` → `src/*`.
