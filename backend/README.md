Express Backend for 333_Express

Tech stack
- Node.js + Express
- MySQL (mysql2/promise)
- JWT auth, bcrypt password hashing

Setup
1) Create DB and seed (XAMPP/MySQL)
- Start MySQL from XAMPP, open phpMyAdmin, then import:
  - `database/schema.sql` (creates DB `333express`)
  - `database/seed.sql`

2) Configure environment
- Copy `.env.example` to `.env` and update DB credentials (for XAMPP defaults: `DB_USER=root`, `DB_PASSWORD=` empty, `DB_NAME=333express`).

3) Install deps and run
- `cd backend`
- `pnpm i` or `npm i` or `yarn`
- `pnpm dev` (listens on `http://localhost:4000`)

Key Endpoints
- `POST /auth/register` — Create customer account
- `POST /auth/login` — Returns `{ token, user }`
- `POST /orders` — Create order (auth: customer/admin)
- `GET /orders/:id` — Order details (auth)
- `PATCH /orders/:id/status` — Update status (auth: warehouse/shipper/admin)
- `GET /orders/public/track/:tracking` — Public tracking by code (no auth)
- `GET /orders/:tracking/route` — Route for Leaflet polyline (no auth)
- `GET /fees/calculate?fromLat=&fromLng=&toLat=&toLng=&weightKg=` — Fee preview
- `GET /warehouses` — List warehouses
- `GET /admin/users` — Users list (auth: admin)
- `GET /admin/analytics` — Basic KPIs (auth: admin)

Status flow
- Enforced via AllowedTransitions (see `src/constants/status.ts`).

Notes
- Next.js proxy: `app/api/auth/login/route.ts` forwards login to this backend and returns only `user` while setting `auth_token` cookie.
- Extend `app/api` to proxy other routes as needed, or point frontend to `NEXT_PUBLIC_API_BASE_URL` directly.
