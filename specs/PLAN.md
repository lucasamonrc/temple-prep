# Temple Preparation Packet App — Master Plan

## Purpose

A web app for LDS temple preparation instructors to create personalized, interactive packets for students approaching their first temple visit. Replaces printed handouts with a persistent, mobile-friendly experience students can access via a unique link.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│         Vite + React + TypeScript + Tailwind         │
│                                                     │
│  ┌──────────────┐        ┌────────────────────────┐ │
│  │ Admin Portal  │        │  Student Packet Page   │ │
│  │ /admin/*      │        │  /p/:uuid              │ │
│  │ PIN-protected │        │  Public (UUID link)    │ │
│  └──────┬───────┘        └───────────┬────────────┘ │
└─────────┼────────────────────────────┼──────────────┘
          │           /api             │
          ▼                            ▼
┌─────────────────────────────────────────────────────┐
│              Cloudflare Worker (Hono)                │
│                                                     │
│  /api/admin/*  (PIN auth)    /api/packets/:uuid/*   │
│                                                     │
│                 Cloudflare D1 (SQLite)               │
└─────────────────────────────────────────────────────┘
```

## Feature Specs

| Feature | Spec File | Status |
|---------|-----------|--------|
| Database Schema & Data Model | [database.md](database.md) | Complete |
| API Routes & Contracts | [api.md](api.md) | Complete |
| Admin UI (Login, Dashboard, CRUD) | [admin-ui.md](admin-ui.md) | Complete |
| Student Packet Page (all sections) | [student-packet.md](student-packet.md) | Complete |
| Student PIN Lookup | [student-lookup.md](student-lookup.md) | Complete |
| E2E Test Plan & Acceptance Criteria | [e2e-tests.md](e2e-tests.md) | Complete |

## Implementation Phases

### Phase 1: Scaffolding ✅
- Monorepo with pnpm workspaces
- Worker package with Hono
- Frontend package with Vite + React + Tailwind
- React Router v7 route structure
- Playwright config
- Git repository
- README, AGENTS.md, specs/

### Phase 2: Database + API ✅
- D1 migration with full schema
- Admin auth middleware
- Admin CRUD routes (packets)
- Student packet read route
- Student interactive routes (goals, escort, reflections, journal, todos)

### Phase 3: Admin UI ✅
- Login page with PIN authentication
- Dashboard listing all packets
- Create/Edit packet form
- Packet preview (student view)
- QR code generation for student links

### Phase 4: Student Packet Page ✅
All 13 sections, mobile-first:
1. Cover Page
2. Congratulations
3. Instructor's Testimony
4. Personal Note
5. Goal Setting (3 milestones)
6. Temple Escort
7. Spiritual Resources (talks + scriptures + QR codes)
8. Reflection Questions (auto-save)
9. Temple Journal
10. What to Expect
11. To-Do Checklist
12. Contacts
13. Closing Encouragement

### Phase 5: E2E Tests ✅
- Admin login/rejection
- Packet CRUD
- Student page load + sections
- Interactive features (goals, escort, reflections, journal, todos)
- Mobile responsiveness
- Student PIN lookup (AC-18 through AC-23)
- 42/42 tests passing (chromium + mobile-chrome)

### Phase 7: Student PIN Lookup ✅
- `student_pin` column added to `packets` table
- `POST /api/packets/lookup` endpoint (first name + last name + PIN, case-insensitive)
- Student lookup page at `/` (landing page)
- Admin: PIN field in packet create/edit form, PIN shown on dashboard
- 6 new e2e tests (AC-18 through AC-23)
- 42/42 tests passing (chromium + mobile-chrome)

### Phase 8: Polish
- Print CSS
- Final mobile polish
- Any remaining refinements

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | pnpm workspaces | Simple, fast, native workspace support |
| Frontend framework | React + Vite | Fast dev, familiar, good Tailwind support |
| Router | React Router v7 (declarative) | Simple client-side routing, no SSR needed |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first, fast iteration |
| Backend | Cloudflare Workers + Hono | Edge-deployed, fast, integrated with D1 |
| Database | Cloudflare D1 | SQLite on the edge, zero config, free tier |
| QR Codes | qrcode.react | Render QR codes client-side, no server dependency |
| E2E Tests | Playwright | Cross-browser, mobile emulation, reliable |
| Fonts | EB Garamond (serif) + Inter (sans) | Warm, elegant serif for headers; clean sans for body |

## Static Content Sources

### General Conference Talks
5 verified talks (2021-2025) about temple covenants and blessings. Defined in `packages/frontend/src/lib/constants.ts`.

### Key Scriptures
7 verified scripture references from D&C, Psalms, Isaiah, and 3 Nephi. All URLs verified against churchofjesuschrist.org.

### Default To-Do Items
16 items across 6 categories derived from the lesson plan and official manual (Endowed from on High, Lesson 6).

### Reflection Questions
4 questions designed to prompt spiritual preparation before the first temple visit.
