# GEMINI.md - Project Context

## Project Overview
This project is a high-performance **Next.js 16 (App Router)** starter kit, optimized for the **Bun** runtime and package manager. It provides a complete foundation for building modern web applications with integrated authentication, database management, and a robust UI system.

### Main Technologies
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Authentication:** [Better Auth](https://www.better-auth.com/) (Email/Password & Google OAuth)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) based primitives (located in `components/ui/`)
- **Emails:** [HubMail](https://hubmail.space/) for transactional emails (verification, password reset)

---

## Project Documentation
Always refer to these documents for business logic, platform features, and architectural details:
- **Full Platform Pages:** `.material/docs/FULL PLATFORM PAGES 2ee9e6b4249980fb81b5f02f09ae1d80.md`
- **Full Description:** `.material/docs/FULL DESCRIPTIO.md`

---

## Building and Running
The project uses Bun for all scripts.

| Task | Command |
| :--- | :--- |
| **Development** | `bun dev` |
| **Production Build** | `bun run build` |
| **Start Production** | `bun start` |
| **Linting** | `bun run lint` |
| **DB Push** | `bun run db:push` |
| **DB Pull** | `bun run db:pull` |
| **DB Studio** | `bun run db:studio` |

---

## Project Structure
- `app/`: Contains the Next.js App Router routes, layouts, and server actions.
  - `(auth)/`: Authentication-related UI routes (Login, Register, etc.).
  - `api/auth/[...all]/`: Better Auth handler.
- `components/ui/`: Reusable UI primitives and composite components.
- `db/`: Database configuration and schema definitions.
  - `index.ts`: Drizzle client initialization.
  - `schema.ts`: Database tables and relationships.
- `lib/`: Shared utilities and client-side helpers.
  - `auth-client.ts`: Better Auth client instance.
- `auth.ts`: Server-side Better Auth configuration.

---

## Development Conventions
- **Runtime:** Always use `bun` instead of `npm`, `yarn`, or `pnpm`.
- **Authentication:** Prefer using the `authClient` from `@/lib/auth-client` for client-side operations and `auth` from `@/auth` for server-side logic.
- **Server Actions:** Use server actions for form submissions and data mutations, typically located in `_actions.ts` files within route directories.
- **Database Migrations:** Use `bun run db:push` to sync the schema with the database during development.
- **Styling:** Adhere to Tailwind CSS v4 patterns. Design tokens are managed via CSS variables in `app/globals.css`.
- **Components:** Before creating a new UI component, check `components/ui/` for existing primitives that can be extended or composed.




# Note
- dont run build, let me know i will run it my self, and dont run dev, let me run it myself too
- dont run lint, let me know i will run it my self too
- always remember actions or components that are only locally to a page they should be in that page
folder, no global actions or components that are only used in one place
- avoid using type any, always make sure everything have proper types
- try to keep page as server components
- always fetch data using server actions never use api routes, unless they is no other option or i tell  you to
- **NEVER use purple colors or purple gradients in the UI.** Stick to minimal and professional colors like slate, zinc, emerald, and amber. Use standard Tailwind font weights (avoid `font-black` unless essential).
- dont use this icon <Sparkles className="h-4 w-4" /> i hate it
