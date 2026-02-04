# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project layout

- The main Next.js app lives in the root directory.
- Application source is under `src/`:
  - `app/` – App Router entry point and route tree (e.g. `page.tsx`, `tasks/page.tsx`, `goals/page.tsx`, `people/page.tsx`, `intelligence/page.tsx`, `settings/page.tsx`, plus `layout.tsx` and `globals.css`).
  - `app/actions/` – Server Actions for domain operations (currently `tasks.ts`, `meetings.ts`).
  - `app/api/` – Route handlers for API endpoints (currently stubs like `ai/route.ts`).
  - `components/` – Shared React components (e.g. `sidebar-nav`, `AITerminal` placeholder).
  - `components/ui/` – Low-level visual primitives (`Button`, `Card`, `Pill`, `BrandMark`, simple `cn` helper).
  - `lib/` – Backend-oriented utilities (`db.ts` for Prisma, `utils.ts` with a Tailwind-aware `cn` helper).
- Database schema and migrations live in `prisma/` (configured via `prisma.config.ts`).

A TypeScript path alias is configured in `tsconfig.json`:

- `@/*` → `src/*` (e.g. `@/lib/db` → `src/lib/db.ts`).

## Core commands

### Install dependencies

```bash
npm install
```

### Run the dev server

Starts the Next.js App Router dev server on port 3000 by default:

```bash
npm run dev
```

Then open `http://localhost:3000` in a browser.

### Build and run in production mode

```bash
npm run build
npm start
```

### Linting

ESLint is configured via `eslint.config.mjs` using `eslint-config-next` (core web vitals + TypeScript):

```bash
npm run lint
```

### Prisma / database workflow (Supabase Postgres)

Prisma is configured via `prisma.config.ts` and expects environment variables loaded like Next.js:

- Place **shared** database env in `.env`.
- For **local-only overrides**, use `.env.local` (these override `.env` when present).
- Required variables:
  - `DATABASE_URL` – Supabase **pooled** connection string (used by the Next.js runtime).
  - `DIRECT_URL` – Supabase **direct** connection string (used by Prisma migrations / client where needed).

Common commands:

```bash
# Validate the schema and datasource
npx prisma validate

# Check migration status
npx prisma migrate status

# Create and apply a new migration locally
npx prisma migrate dev --name vv_init

# Generate Prisma Client
npx prisma generate
```

In deployment environments like Vercel, set `DATABASE_URL` to the pooled (pgBouncer) string and `DIRECT_URL` to the direct (non-pooled) string so runtime queries and migrations use appropriate connections.

> Note: There are currently no test runners or `test` scripts defined in `package.json`. If you add a test setup (e.g. Jest or Vitest), document the commands here for future agents.

## High-level architecture

### App shell and layout

- `src/app/layout.tsx` defines the root HTML structure and two-column layout:
  - Left column: a sticky sidebar card containing branding and `SidebarNav`.
  - Right column: the main content area with the date-based header, status pills, and footer.
- Global fonts are configured via `next/font/google` (Inter, Playfair Display, JetBrains Mono) and applied using CSS variables on the `<html>` element.
- `src/app/globals.css` defines the **VV visual system**:
  - CSS variables for background/foreground and brass accent colors.
  - Reusable utility classes (`.vv-card`, `.vv-panel`, `.vv-pill`, `.vv-kicker`, `.vv-input`, `.vv-btn`, `.vv-btn-ghost`, `.vv-focus`, `.vv-rule`, `.vv-rule-brass`, `.vv-accent-dot`).
  - Watermark helpers (`.vv-watermark`, `.vv-watermark-soft`) that overlay the real VV logo PNG.
  - Tailwind is imported once at the top; Tailwind utilities are used alongside these custom classes.

When adding new top-level sections or complex views, prefer composing these existing primitives rather than inventing new card/button styles.

### Routing and navigation

- The app uses the Next.js **App Router** rooted at `src/app/`.
- Key routes:
  - `/` → `app/page.tsx` – **Control Room** client component (daily priorities, actions, inbox, scorecard).
  - `/tasks` → `app/tasks/page.tsx` – server component backed by Prisma `task` records and server actions.
  - `/goals`, `/people`, `/intelligence`, `/settings`, `/meetings` – directories exist with page stubs or future expansion points.
- `src/app/layout.tsx` wraps **all** routes, so shared layout changes (background, header, two-column grid, fonts) should be made there.
- `src/components/sidebar-nav.tsx` is the single source of truth for the primary nav:
  - Defines a static `NAV` array of items (label, href, kicker).
  - Uses `usePathname()` to compute an `active` state (exact match for `/`, prefix match for other sections).
  - Applies VV-specific focus and “active” styling.

When introducing a new top-level page, add a directory with `page.tsx` under `src/app/`, then register it in `sidebar-nav.tsx` so the navigation and active states remain consistent.

### Data layer and server actions

- `src/lib/db.ts` centralizes the Prisma client:
  - Exports `db` (a singleton `PrismaClient`) with `log: ["error"]`.
  - Uses `globalThis` to reuse the client in development and avoid connection storms.
- `prisma/schema.prisma` defines the database models, including `task` and `meeting` tables used in the app.

#### Tasks

- Route: `src/app/tasks/page.tsx` (server component).
- Data access: imports `db` from `@/lib/db` and performs `db.task.findMany({ orderBy: { createdAt: "desc" } })`.
- Mutations are encapsulated in **server actions** in `src/app/actions/tasks.ts`:
  - `createTask(title: string)` – trims the title, no-op on empty, creates a task with initial `status: "NEXT"`, then `revalidatePath("/")` and `revalidatePath("/tasks")`.
  - `updateTask(taskId, updates)` – generic update wrapper (title/notes/status), revalidates the same paths.
  - `toggleTaskDone(taskId)` – flips `doneAt` between `null`/`new Date()` and toggles `status` between `"NEXT"` and `"DONE"`, then revalidates.
  - `deleteTask(taskId)` – deletes the record and revalidates.
- `TasksPage` wires these actions through HTML forms using the `action={async (fd) => { "use server"; ... }}` pattern so mutations stay server-side while the UI remains simple.

If you add new task-related functionality, prefer expanding the `actions/tasks.ts` module and calling those actions from route components rather than issuing raw `db.*` calls everywhere.

#### Meetings

- Server actions are defined in `src/app/actions/meetings.ts`:
  - `createMeeting`, `rescheduleMeeting`, `deleteMeeting` all operate on `db.meeting` and call `revalidatePath("/")` and `revalidatePath("/meetings")`.
- `src/app/meetings/page.tsx` is currently empty, serving as a placeholder for the future meetings UI.

Future meeting-related UIs should consume these actions rather than talking to Prisma directly.

Future meeting-related UIs should consume these actions rather than talking to Prisma directly.

### Control Room (home page) behavior

- `web/src/app/page.tsx` is a **client component** (`"use client"`) that implements the “Control Room” dashboard:
  - Uses local React state to manage three lists: `priorities`, `actions`, and `inbox`.
  - Generates stable-ish IDs via a local `uid()` helper.
  - Provides small in-component helpers (`addPriority`, `addAction`, `addInbox`, `togglePriority`, `toggleAction`, `clearInbox`).
  - Renders a Daily Briefing, KPI summary row, main priorities/actions area, quick capture inbox, and a static behavioral scorecard.
- UI is composed from local helper components (`Card`, `Kpi`, `Pill`, `Dot`, `AddRow`, `RowItem`, `ActionRow`, `ScoreRow`) defined at the bottom of the same file.

When evolving the Control Room, keep in mind that it is intentionally **local-state only** today. If you shift it to persistent storage (e.g. Prisma), reuse the patterns already established on the Tasks page.

### UI primitives and helpers

- `web/src/components/ui/` contains sharable building blocks:
  - `Button.tsx` – wraps a `<button>` element and applies either `vv-btn` or `vv-btn-ghost` plus consistent padding/focus styles. Accepts `ghost` and forwards other button props.
  - `Card.tsx` – simple card wrapper that mirrors the structure of Control Room cards (title, optional kicker/right label, body content), using `.vv-card` styling.
  - `Pill.tsx` – pill-shaped label with optional `muted` style and exported `Dot` accent component.
  - `BrandMark.tsx` – renders the VV logo inside a stylized frame with a brass aura; useful for hero/brand sections.
  - `cn.ts` – very small string-based class name joiner.
- `web/src/lib/utils.ts` defines a separate `cn` helper that composes `clsx` with `tailwind-merge`, suited for more complex Tailwind class composition.

When adding new components:

- Prefer using `Card`, `Button`, `Pill`, and the global VV CSS primitives for a consistent look.
- Use `lib/utils.ts`'s `cn` helper where you need full Tailwind class merging; use the lightweight `components/ui/cn.ts` for simple string concatenation.

### API and AI stubs

- `web/src/app/api/ai/route.ts` and `web/src/components/AITerminal.tsx` currently exist as empty stubs.
- The `openai` dependency is present in `web/package.json`, but the AI endpoint and UI are not yet implemented.

When implementing AI functionality:

- Define the handler in `app/api/ai/route.ts` using Next.js Route Handlers.
- Build the terminal or chat UI in `components/AITerminal.tsx` and embed it in appropriate pages.

### Next.js configuration and linting

- `web/next.config.ts` enables the React Compiler (`reactCompiler: true`). Be cautious about patterns that are incompatible with the compiler (e.g. very dynamic hook usage); follow Next.js guidance when refactoring.
- `web/eslint.config.mjs` composes `eslint-config-next` presets and customizes global ignores to only skip build artifacts (`.next/**`, `out/**`, `build/**`, `next-env.d.ts`).

If you add new tooling (e.g. test runner, storybook), update the ignore list and scripts accordingly so linting continues to work across the whole app without accidentally ignoring important code.
