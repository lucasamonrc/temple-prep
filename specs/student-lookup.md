# Student PIN Lookup

## Purpose

Provides a simple entry point for students to access their packet without needing to share or bookmark a long UUID link. The instructor shares the app URL and a 4-6 digit PIN with each student. The student enters their first name, last name, and PIN to be redirected to their packet.

## Route

`/` — The root URL is the student lookup page (landing page). The admin portal is accessed via `/admin`.

## How It Works

1. Instructor creates a packet and assigns a 4-6 digit numeric PIN
2. Instructor shares the app URL and PIN with the student (verbally in class, text, etc.)
3. Student visits the app, enters their first name, last name, and PIN
4. Backend matches `first_name + " " + last_name` (case-insensitive) against `packets.student_name` and exact-matches `student_pin`
5. On success, the student is redirected to `/p/:uuid`
6. On failure, an error message is shown

## Database

- `student_pin TEXT` column on the `packets` table
- Added via `migrations/0002_student_pin.sql`
- The PIN is not globally unique — the combination of (name + PIN) identifies the student

## API

- `POST /api/packets/lookup` — Public endpoint
- Request: `{ "first_name": "John", "last_name": "Smith", "pin": "5678" }`
- Success: `{ "uuid": "packet-uuid" }`
- Failure: 404 with error message

## Admin UI

- **Packet form**: "Student PIN" field in the "Student Information" section, required, 4-6 digits, numeric keyboard on mobile
- **Dashboard**: Each packet card shows its PIN (e.g., "PIN: 5678")

## Frontend

- `src/pages/student/Lookup.tsx` — The lookup form page
- `src/lib/api.ts` — `lookupPacket()` function
- `src/router.tsx` — `/` routes to `StudentLookup`, `/admin` routes to `AdminLogin`

## Security Notes

- The PIN is a convenience feature, not a security boundary
- Real security remains UUID obscurity (same as before)
- Name matching is case-insensitive
- No rate limiting currently implemented (future enhancement)
