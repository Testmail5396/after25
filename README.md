# After25 Cakes — Bakery Tracker

A simple income, expense, sales, customer and business-insights app for a small home bakery
(cakes and brownies). Built for two private users on their phones.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS, Lucide icons, Recharts
- Netlify Functions (API layer) + Netlify Blobs (primary datastore)
- Dexie (IndexedDB) as a local read cache for offline viewing
- Zod for shared validation, date-fns for date math
- Vitest for business-logic unit tests

## Where data lives

Netlify Blobs is the single source of truth, in a site-wide store named `after25cakes-data`.
Every sale and purchase is stored as its **own** blob record (never one big JSON blob), so two
people editing at the same time don't overwrite each other:

- `orders/{orderId}` — one sale
- `purchases/{purchaseId}` — one purchase

All reads/writes go through Netlify Functions (`netlify/functions/*`), which check the session
cookie before touching any data. The browser never talks to Blobs directly and never sees any
Netlify credentials.

IndexedDB (via Dexie) only stores the **last successfully synced copy** of orders/purchases, so
the app can still show data instantly and work read-only when offline. When there's no network,
you'll see an "Offline — showing last synced data" banner and data won't be editable.

## Authentication

Two users, configured entirely through environment variables — nothing is hardcoded:

```
APP_USER_1_USERNAME / APP_USER_1_PASSWORD
APP_USER_2_USERNAME / APP_USER_2_PASSWORD
SESSION_SECRET
```

- Login is validated only inside the `auth-login` Netlify Function.
- On success, a session token (HMAC-signed with `SESSION_SECRET`) is set as a
  `Secure; HttpOnly; SameSite=Strict` cookie. It's never accessible to frontend JS.
- Every data function (`orders`, `orders-item`, `purchases`, `purchases-item`, `backup-export`,
  `backup-import`) checks this cookie and returns `401` if it's missing/invalid/expired.
- `auth-logout` clears the cookie. `auth-session` reports the current user (or `401`).

## Project structure

```
shared/                 Zod schemas + TypeScript types shared by frontend & functions
netlify/functions/       API layer (auth, orders, purchases, backup)
  _shared/               auth, blobs, sanitize, response, error-wrapping helpers
src/
  lib/                   Pure business logic (calculations, dates, phone, customers, occasions...)
  lib/db.ts              Dexie local cache
  lib/api.ts              fetch() client for the Netlify Functions API
  context/                Auth + Data React contexts (sync, offline detection, CRUD)
  components/             UI building blocks, forms, layout, charts
  pages/                   Route-level screens
```

## Local development

Install dependencies:

```bash
npm install
```

Copy the env template and fill in local test credentials:

```bash
cp .env.example .env
```

Run with Netlify Functions + Blobs support (recommended — this is how auth and data actually work):

```bash
npm run netlify:dev
```

The first time, run `netlify link` (or `netlify init`) so the CLI can emulate Netlify Blobs
locally — without a linked site, Blobs calls will fail with a clear "environment not configured"
error, and the API will return sanitized `500` responses.

Plain `npm run dev` also works but only serves the frontend — it does **not** run the API, so
login and data will not work. Use `netlify:dev` for anything beyond looking at static layout.

### Loading sample data

Sign in, go to **More**, and (in local development only) use **"Load sample data"** under
*Developer tools*. It adds a handful of cake/brownie sales (including repeat orders from the same
customer), purchases, and one upcoming birthday reminder. This button is not rendered in
production builds and never runs automatically.

## npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server only (frontend, no API) |
| `npm run netlify:dev` | Full local stack via Netlify CLI (frontend + functions + Blobs) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm test` | Run Vitest business-logic tests once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript project-wide type check, no emit |

## Deploying to Netlify

1. Push this repository to GitHub/GitLab/Bitbucket (or use `netlify deploy` directly).
2. In Netlify, create a new site from the repo. Build settings are already defined in
   `netlify.toml` (`npm run build`, publish `dist`, functions in `netlify/functions`) — no changes
   needed.
3. Under **Site settings → Environment variables**, add:
   - `APP_USER_1_USERNAME`, `APP_USER_1_PASSWORD`
   - `APP_USER_2_USERNAME`, `APP_USER_2_PASSWORD`
   - `SESSION_SECRET` — a long random string, e.g. generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
4. Deploy. Netlify Blobs works automatically on deployed sites — no extra configuration or
   provisioning is required; the `after25cakes-data` store is created on first write.
5. Redeploy whenever you change environment variables so functions pick up the new values.

## Data backup & restore

Under **More → Backup & Data**:

- **Download full JSON backup** — every order and purchase, in a format that can be re-imported.
- **Download sales as CSV** / **Download purchases as CSV** — for spreadsheets, separate from the
  JSON backup.
- **Choose backup file** — validates the file's structure with the same schema used by the API
  before anything happens, then asks for confirmation showing exactly how many sales/purchases
  will be imported. Import **upserts by id**: matching records are updated, new ones are added,
  and existing records not present in the file are left untouched (nothing is deleted).

## Reminders — what they are and aren't

The Reminders feature (dashboard widget + full page under **More → Reminders**) tracks birthdays
and anniversaries recorded on sales, and shows them starting 30 days before the next occurrence,
counting down, and staying visible as "overdue" if the date passes without action. Leap-day
(Feb 29) occasions are safely observed on Feb 28 in non-leap years.

**This is an in-app list only.** It does not send push notifications, emails, or WhatsApp
messages automatically. The "Call" and "WhatsApp" buttons open your phone's dialer or WhatsApp
with a pre-filled message so *you* decide when to send it — nothing is sent on your behalf.

## Design notes

Warm cream background, blush pink accents, chocolate-brown text, muted berry highlights, rounded
cards, minimal shadows — styled to feel like a small bakery's own tool rather than a generic admin
dashboard. Mobile-first with a bottom nav (Dashboard, Sales, Purchases, Customers, More) and a
compact sidebar on desktop; all touch targets are at least 44px, forms preserve input on
validation errors, and destructive actions (delete sale/purchase, logout) always ask for
confirmation first.
