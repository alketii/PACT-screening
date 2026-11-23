# PACT Screening

Public sign-up wizard for the PACT study, meant to be shared on social media. Albanian UI, mobile first.

1. **Intro** — what the study is and what happens next.
2. **Contact** — name, age (18–65 only), phone, consent.
3. **Questions** — short yes/no self-report version of the screening, one question per screen.
4. **Thank you** — no eligibility result is shown; the team decides after calling.

Anyone who reports suicidal thoughts sees support contacts immediately and again on the last screen.

`/admin` lists the entries (password from `ADMIN_PASSWORD`): contact details, answers, orientation flags, a status per entry, and delete.

## Run locally

Requires Node 22+ and a Postgres database.

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL and ADMIN_PASSWORD
npm run db:migrate           # creates the `entries` table
npm run dev                  # http://localhost:3000 and /admin
```

## Database: Neon (free plan)

1. Create a project at neon.com and choose an **EU region**.
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Run `npm run db:migrate` once.

Any other Postgres works the same way (Supabase, your own server): only `DATABASE_URL` changes.

## Deploy on Vercel

1. Push this folder to a GitHub repository and import it at vercel.com.
2. In the Vercel project settings, add `DATABASE_URL` (Neon pooled string) and `ADMIN_PASSWORD` as environment variables.
3. Deploy. The tables are created from your computer with `npm run db:migrate`, not by Vercel.

`/admin` has a "Shkarko Excel" button that downloads all entries as an .xlsx file.

## Before sharing the link

- [ ] Study team approves the intro and consent texts (`src/app/wizard.tsx`) and the question wording (`src/lib/questions.ts`).
- [ ] Add verified crisis contacts in `src/config/site.ts` (only 112 is listed now).
- [ ] Decide who checks `/admin` and how quickly entries marked "me përparësi" are called.
- [ ] Use a long random `ADMIN_PASSWORD`.

## Files

| Path | Purpose |
|---|---|
| `src/app/wizard.tsx` | The wizard (all public screens) |
| `src/lib/questions.ts` | Questions, skip logic, flags for the team |
| `src/config/site.ts` | Age limits and support contacts |
| `src/app/actions.ts` | Server-side validation and saving of an entry |
| `src/app/admin/` | Admin panel, login, status and delete actions |
| `src/db/schema.ts` | `entries` table |
