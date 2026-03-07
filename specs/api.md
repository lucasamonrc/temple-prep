# API Routes

Base URL: `/api`

## Authentication

Admin routes require `Authorization: Bearer <pin>` header. The PIN is stored as a Cloudflare Workers secret (`ADMIN_PIN`).

The `/api/admin/login` endpoint is the only admin route that does not require the auth header (it validates the PIN in the request body).

Student routes (`/api/packets/:uuid/*`) are public. Security is through UUID obscurity — UUIDs are generated server-side with `crypto.randomUUID()`.

## Admin Routes

### POST `/api/admin/login`
Validate the admin PIN.

**Request:**
```json
{ "pin": "1234" }
```

**Response (200):**
```json
{ "success": true }
```

**Response (401):**
```json
{ "error": "Invalid PIN" }
```

### GET `/api/admin/packets`
List all packets (summary view).

**Response (200):**
```json
{
  "packets": [
    { "id": "uuid", "student_name": "...", "created_at": "...", "updated_at": "..." }
  ]
}
```

### POST `/api/admin/packets`
Create a new packet. Automatically seeds:
- 3 goal rows (bishop_interview, stake_interview, temple_appointment)
- 1 escort row
- 4 reflection rows (one per question)
- 16 default to-do items

**Request:** Full packet fields (see database.md for columns).

**Response (201):**
```json
{ "id": "generated-uuid" }
```

### GET `/api/admin/packets/:id`
Get full packet with all related data (goals, escort, reflections, journal, todos).

### PUT `/api/admin/packets/:id`
Update packet fields. Only send the fields you want to update.

### DELETE `/api/admin/packets/:id`
Delete a packet and all related data (cascading).

## Student Routes

### GET `/api/packets/:uuid`
Get the full packet with all related data. Same shape as the admin GET.

**Response (404):**
```json
{ "error": "Packet not found" }
```

### PUT `/api/packets/:uuid/goals/:goalType`
Update a goal. `goalType` is one of: `bishop_interview`, `stake_interview`, `temple_appointment`.

**Request:**
```json
{ "scheduled_date": "2026-04-15", "completed": true, "notes": "..." }
```

### PUT `/api/packets/:uuid/escort`
Update escort information.

**Request:**
```json
{ "name": "...", "phone": "...", "email": "...", "relationship": "..." }
```

### PUT `/api/packets/:uuid/reflections/:key`
Upsert a reflection response. `key` is one of: `ask_lord`, `gratitude`, `help_needed`, `power_sought`.

**Request:**
```json
{ "response": "My reflection text..." }
```

### POST `/api/packets/:uuid/journal`
Create a new journal entry.

**Request:**
```json
{ "entry_date": "2026-04-20", "content": "..." }
```

**Response (201):**
```json
{ "id": 1 }
```

### PUT `/api/packets/:uuid/journal/:id`
Update an existing journal entry.

### DELETE `/api/packets/:uuid/journal/:id`
Delete a journal entry.

### PUT `/api/packets/:uuid/todos/:id`
Toggle a to-do item's completion status.

**Request:**
```json
{ "completed": true }
```
