# Heptadev Starterkit

A Next.js 16 app-router starter with authentication, a Postgres-backed data layer, and a reusable UI component library.

## What is inside

- Next.js 16 App Router with server actions
- Auth via `better-auth` (email/password + Google OAuth)
- Postgres + Drizzle ORM
- Tailwind CSS v4 + Radix UI-based components
- Email delivery via HubMail

## Project layout

```
app/                  App Router routes, layouts, and server actions
  api/auth/[...all]/  Auth route handler (better-auth adapter)
  (auth)/             Auth UI routes (login/register/reset/forgot)
components/ui/        Reusable UI primitives and composites
db/                   Drizzle database connection and schema
hooks/                Shared React hooks
lib/                  Utilities and client helpers
public/               Static assets
```

## Auth flow

- `auth.ts` configures `better-auth` with email/password, Google, and email verification.
- `app/api/auth/[...all]/route.ts` exposes the auth endpoints to Next.js.
- `app/(auth)/**` contains UI routes that call server actions in `app/(auth)/*/_actions.ts`.
- Cookie handling lives in `app/(auth)/_utils/auth-cookies.ts` and is applied after sign-in/up.

## Database

- `db/schema.ts` defines users, sessions, accounts, and verification tables.
- `db/index.ts` exports the Drizzle client using `DATABASE_URL`.
- Drizzle commands are wired in `package.json` scripts.

## UI system

- Tailwind CSS v4 in `app/globals.css` defines design tokens and theme variables.
- `components/ui` wraps Radix UI primitives and other packages (e.g. `react-resizable-panels`, `sonner`, `recharts`).
- Fonts are set via CSS variables to a system stack, so the app builds without external font downloads.

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```
APP_NAME=Starterkit
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=replace-with-32-char-secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
HUBMAIL_KEY=hm_your_api_key
HUBMAIL_FROM=your-sender@hubmail.space
```

## Scripts

- `bun dev` - start local dev server
- `bun run build` - production build
- `bun start` - run production server
- `bun run lint` - lint
- `bun run db:push` - push Drizzle schema
- `bun run db:pull` - pull Drizzle schema
- `bun run db:studio` - Drizzle Studio

## How it fits together

- UI pages call server actions for auth and form handling.
- Server actions call the `better-auth` API, which writes to Postgres through Drizzle.
- Auth cookies are applied so the Next.js app can read sessions on subsequent requests.
- UI primitives in `components/ui` are reused across pages for consistent styling and behavior.

## Notes

- Google OAuth requires valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Email verification and password resets are sent via HubMail.
