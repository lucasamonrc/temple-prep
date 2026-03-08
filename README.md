# Temple Preparation Packet App

A web app for LDS temple preparation instructors to create personalized, interactive preparation packets for students approaching their first temple visit.

## What It Does

- **Instructor (Admin) Portal**: Create and manage student packets. Fill in student-specific data (name, ward contacts, personal testimony, notes, etc.)
- **Student Packet Page**: Each student gets a unique URL with their personalized packet. Mobile-friendly, interactive, and persistent. Students can:
  - Track key milestones (bishop interview, stake interview, temple appointment)
  - Record their temple escort's contact info
  - Access curated General Conference talks and scriptures with QR codes
  - Reflect on personal spiritual preparation questions
  - Journal their temple experience
  - Work through a to-do checklist of everything needed before the temple visit
  - View their important contacts (bishop, executive secretary, ministering brothers/sisters, instructor)

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | Vite + React + TypeScript + React Router v7         |
| Backend API | Cloudflare Workers + Hono                           |
| Integration | @cloudflare/vite-plugin (single dev server)         |
| Database    | Cloudflare D1 (SQLite)                              |
| QR Codes    | qrcode.react                                        |
| Styling     | Tailwind CSS v4                                     |
| E2E Tests   | Playwright                                          |
| Hosting     | Cloudflare Workers + Assets                         |

## Project Structure

```
temple-prep/
├── src/                 # React frontend (SPA)
│   ├── components/      # UI and packet section components
│   ├── pages/           # Admin and student page components
│   ├── hooks/           # React hooks
│   ├── lib/             # API client, types, constants
│   └── styles/          # Tailwind entry CSS
├── worker/              # Cloudflare Worker API (Hono)
│   ├── index.ts         # Worker entry point
│   ├── routes/          # API route handlers
│   ├── middleware/       # Auth middleware
│   └── types.ts         # Worker types
├── migrations/          # D1 database migrations
├── e2e/                 # Playwright end-to-end tests
├── specs/               # Feature specs and plans
├── vite.config.ts       # Unified Vite config (React + Cloudflare plugin)
├── wrangler.jsonc       # Cloudflare Workers config (D1, assets, routing)
└── index.html           # SPA entry point
```

## Prerequisites

- Node.js >= 22
- pnpm >= 10

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the local database

```bash
pnpm db:migrate:local
```

### 3. Configure environment

Local secrets are in `.dev.vars` (already provided with a default PIN):

```
ADMIN_PIN=1234
```

Change this PIN to something secure for your use.

### 4. Start development

```bash
pnpm dev
```

This single command starts both the React frontend (with HMR) and the Cloudflare Worker API. Everything runs on `http://localhost:5173`.

### 5. Access the app

- **Admin Portal**: http://localhost:5173/admin (use your PIN to login)
- **Student Packet**: http://localhost:5173/p/{uuid} (created via admin portal)

## Running E2E Tests

```bash
# Install Playwright browsers (first time only)
pnpm --filter e2e exec playwright install

# Run tests
pnpm test:e2e
```

## Deployment

Deployment is to Cloudflare Workers. **Do not deploy without explicit approval.**

When ready:

1. Create a D1 database in Cloudflare:
   ```bash
   wrangler d1 create temple-prep-db
   ```
2. Update `wrangler.jsonc` with the actual `database_id`
3. Set the admin PIN secret:
   ```bash
   wrangler secret put ADMIN_PIN
   ```
4. Run migrations on the remote database:
   ```bash
   pnpm db:migrate
   ```
5. Deploy:
   ```bash
   pnpm deploy
   ```

## Specs

See the `specs/` directory for detailed feature specifications:

- [specs/PLAN.md](specs/PLAN.md) - Overall project plan and architecture
- [specs/database.md](specs/database.md) - Database schema and data model
- [specs/api.md](specs/api.md) - API routes and contracts
- [specs/admin-ui.md](specs/admin-ui.md) - Admin portal features
- [specs/student-packet.md](specs/student-packet.md) - Student packet page sections
- [specs/e2e-tests.md](specs/e2e-tests.md) - E2E test plan and acceptance criteria
