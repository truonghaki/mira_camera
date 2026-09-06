# Mira Camera Rental

Mobile-first web app for managing camera rental schedules.

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and add Supabase values when you are ready to connect the real database. Without those values, the app uses local demo data in the browser.

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor, then optionally run `supabase/seed.sql`.
