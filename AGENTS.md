# Agent Guidelines for Temple Preparation Packet App

## Project Overview

This is a web application for LDS temple preparation instructors. It has two interfaces:

1. **Admin Portal** — Password-protected (PIN), for the instructor to create/manage personalized student packets
2. **Student Packet Page** — Public via unique UUID link, mobile-first, interactive

## Architecture

- **Single project** using `@cloudflare/vite-plugin` to unify frontend and worker
- **Frontend**: `src/` — React + TypeScript + Tailwind CSS v4 + React Router v7 (declarative client-side routes, NOT framework mode)
- **Backend**: `worker/` — Cloudflare Workers + Hono + Drizzle ORM + D1 (SQLite)
- **Tests**: `e2e/` — Playwright end-to-end tests (separate workspace for Playwright deps)
- **Specs**: `specs/` — Feature specifications and plans. Start with `specs/PLAN.md` for the full picture.

### How Frontend + Worker Coexist

The `@cloudflare/vite-plugin` handles routing:
- Requests matching static assets are served directly
- API requests (`/api/*`) are routed to the Worker via `run_worker_first` in `wrangler.jsonc`
- All other routes serve `index.html` (SPA fallback via `not_found_handling: "single-page-application"`)

In dev, `pnpm dev` starts a single Vite server that handles both React HMR and the Worker (running in workerd).

## Key Conventions

### Code Style
- TypeScript strict mode everywhere
- React functional components only
- Tailwind CSS for all styling (v4 with `@import "tailwindcss"` syntax, custom theme via `@theme`)
- Mobile-first responsive design for student pages
- No component libraries — custom UI components in `src/components/ui/`

### React Router v7
- Using declarative routes (NOT framework mode)
- Routes defined in `src/router.tsx`
- Client-side routing only, no SSR

### API
- All routes prefixed with `/api/`
- Admin routes: `/api/admin/*` — protected by `Authorization: Bearer <pin>` header
- Student routes: `/api/packets/:uuid/*` — public, UUID provides security through obscurity
- Hono framework for routing in the worker

### Database
- Cloudflare D1 (SQLite) via **Drizzle ORM** (`drizzle-orm/d1`)
- Schema defined in code: `worker/db/schema.ts` (single source of truth for types + migrations)
- Drizzle client created per-request and injected into Hono context via middleware (`c.get("db")`)
- Types (`Packet`, `Goal`, etc.) derived from schema with `InferSelectModel` / `InferInsertModel` in `worker/types.ts`
- Raw SQL migrations still in `migrations/` (applied via `wrangler d1 execute`)
- Drizzle Kit config in `drizzle.config.ts` for future migration generation
- Foreign keys with `ON DELETE CASCADE`
- JSON strings used for arrays (ministering_brothers, ministering_sisters)

### Configuration Files
- `vite.config.ts` — Unified Vite config with React, Tailwind, and Cloudflare plugins
- `wrangler.jsonc` — Worker config: entry point, assets handling, D1 bindings
- `tsconfig.json` — References tsconfig.app.json, tsconfig.node.json, tsconfig.worker.json
- `.dev.vars` — Local secrets (ADMIN_PIN). Never committed.

### Testing
- Playwright for e2e tests
- Tests organized by feature: `e2e/admin.spec.ts`, `e2e/student-packet.spec.ts`
- Test data fixtures in `e2e/fixtures/test-data.ts`
- Tests use `data-testid` attributes for reliable selectors
- Default dev PIN is `1234`

### Git
- Small, atomic commits
- Conventional commit messages: `feat(scope):`, `fix(scope):`, `test(scope):`, `style(scope):`, `docs:`
- Never deploy to Cloudflare without explicit user approval
- Never commit `.dev.vars` (contains secrets)

## Running Locally

```bash
pnpm install
pnpm db:migrate:local
pnpm dev
```

Single command — everything at http://localhost:5173

## Specs Directory

Always consult `specs/PLAN.md` first. It links to all other spec files and provides the overall architecture and feature list. When implementing a feature, check the relevant spec file for acceptance criteria and implementation details.

## Context: Temple Preparation

This app serves a religious purpose. The content is specifically for members of The Church of Jesus Christ of Latter-day Saints preparing to receive their temple endowment. Be respectful of the sacred nature of the content. The app references:

- General Conference talks by Church leaders
- Scriptures from the Standard Works (Bible, Book of Mormon, Doctrine & Covenants)
- Temple preparation steps (interviews, clothing, escorts, etc.)
- Personal spiritual reflection

Do not alter or remove any of the spiritual content (talks, scriptures, reflection questions) without explicit instruction. The static content (talks, scriptures, default to-dos) is defined in `src/lib/constants.ts`.
