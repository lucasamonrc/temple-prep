# Agent Guidelines for Temple Preparation Packet App

## Project Overview

This is a web application for LDS temple preparation instructors. It has two interfaces:

1. **Admin Portal** — Password-protected (PIN), for the instructor to create/manage personalized student packets
2. **Student Packet Page** — Public via unique UUID link, mobile-first, interactive

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Frontend**: `packages/frontend/` — Vite + React + TypeScript + Tailwind CSS v4 + React Router v7 (declarative client-side routes, NOT framework mode)
- **Backend**: `packages/worker/` — Cloudflare Workers + Hono + D1 (SQLite)
- **Tests**: `e2e/` — Playwright end-to-end tests
- **Specs**: `specs/` — Feature specifications and plans. Start with `specs/PLAN.md` for the full picture.

## Key Conventions

### Code Style
- TypeScript strict mode everywhere
- React functional components only
- Tailwind CSS for all styling (v4 with `@import "tailwindcss"` syntax, custom theme via `@theme`)
- Mobile-first responsive design for student pages
- No component libraries — custom UI components in `packages/frontend/src/components/ui/`

### React Router v7
- Using declarative routes (NOT framework mode)
- Routes defined in `packages/frontend/src/router.tsx`
- Client-side routing only, no SSR

### API
- All routes prefixed with `/api/`
- Admin routes: `/api/admin/*` — protected by `Authorization: Bearer <pin>` header
- Student routes: `/api/packets/:uuid/*` — public, UUID provides security through obscurity
- Hono framework for routing in the worker

### Database
- Cloudflare D1 (SQLite)
- Migrations in `packages/worker/migrations/`
- Schema documented in `specs/database.md`
- Foreign keys with `ON DELETE CASCADE`
- JSON strings used for arrays (ministering_brothers, ministering_sisters)

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
pnpm --filter worker db:migrate:local
# Terminal 1:
pnpm dev:worker
# Terminal 2:
pnpm dev
```

Frontend: http://localhost:5173 (proxies /api to :8787)
Worker: http://localhost:8787

## Specs Directory

Always consult `specs/PLAN.md` first. It links to all other spec files and provides the overall architecture and feature list. When implementing a feature, check the relevant spec file for acceptance criteria and implementation details.

## Context: Temple Preparation

This app serves a religious purpose. The content is specifically for members of The Church of Jesus Christ of Latter-day Saints preparing to receive their temple endowment. Be respectful of the sacred nature of the content. The app references:

- General Conference talks by Church leaders
- Scriptures from the Standard Works (Bible, Book of Mormon, Doctrine & Covenants)
- Temple preparation steps (interviews, clothing, escorts, etc.)
- Personal spiritual reflection

Do not alter or remove any of the spiritual content (talks, scriptures, reflection questions) without explicit instruction. The static content (talks, scriptures, default to-dos) is defined in `packages/frontend/src/lib/constants.ts`.
