# Expense Tracker Frontend

React 19 and Vite client for the Expense Service API.

## Run locally

1. Start PostgreSQL and configure `DATABASE_URL` and `JWT_SECRET` in `../expense-service/.env`.
2. From `../expense-service`, run `npm run db:setup` and `npm run dev`.
3. In this folder, run:

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the service at `http://localhost:3000`.

Seeded accounts can sign in with their email and the shared local password `Test@123`.
