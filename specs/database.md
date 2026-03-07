# Database Schema — Cloudflare D1

## Tables

### `packets`
The core table. One row per student packet, containing all admin-provided data.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | TEXT (PK) | UUID | Unique identifier, used in student URL `/p/{id}` |
| student_name | TEXT (NOT NULL) | — | Student's full name |
| created_at | TEXT | datetime('now') | Creation timestamp |
| updated_at | TEXT | datetime('now') | Last update timestamp |
| testimony | TEXT | NULL | Instructor's personal testimony |
| personal_note | TEXT | NULL | Personalized note to this student |
| congratulations_message | TEXT | NULL | Custom congratulations (or use default) |
| temple_name | TEXT | 'San Antonio Texas Temple' | Target temple |
| temple_phone | TEXT | '(210) 937-5100' | Temple phone number |
| temple_url | TEXT | churchofjesuschrist.org URL | Temple info page |
| bishop_name | TEXT | NULL | Student's bishop |
| bishop_phone | TEXT | NULL | Bishop's phone |
| bishop_email | TEXT | NULL | Bishop's email |
| exec_secretary_name | TEXT | NULL | Ward executive secretary |
| exec_secretary_phone | TEXT | NULL | Exec secretary phone |
| exec_secretary_email | TEXT | NULL | Exec secretary email |
| ministering_brothers | TEXT | NULL | JSON array of `{name, phone, email?}` |
| ministering_sisters | TEXT | NULL | JSON array of `{name, phone, email?}` |
| instructor_name | TEXT | NULL | Temple prep instructor name |
| instructor_phone | TEXT | NULL | Instructor phone |
| instructor_email | TEXT | NULL | Instructor email |

### `goals`
Three goal rows per packet (seeded on creation).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, AUTO) | |
| packet_id | TEXT (FK → packets.id, CASCADE) | |
| goal_type | TEXT | `bishop_interview`, `stake_interview`, or `temple_appointment` |
| scheduled_date | TEXT | Date string (YYYY-MM-DD) |
| completed | INTEGER | 0 or 1 |
| notes | TEXT | Optional notes |

### `escorts`
One row per packet (seeded on creation).

| Column | Type | Description |
|--------|------|-------------|
| packet_id | TEXT (PK, FK → packets.id, CASCADE) | |
| name | TEXT | Escort's name |
| phone | TEXT | Escort's phone |
| email | TEXT | Escort's email |
| relationship | TEXT | How student knows them |

### `reflections`
Four rows per packet (seeded on creation), one per question.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, AUTO) | |
| packet_id | TEXT (FK → packets.id, CASCADE) | |
| question_key | TEXT | `ask_lord`, `gratitude`, `help_needed`, `power_sought` |
| response | TEXT | Student's written response |
| updated_at | TEXT | Last update timestamp |

UNIQUE constraint on (packet_id, question_key).

### `journal_entries`
Zero or more entries per packet, created by the student.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, AUTO) | |
| packet_id | TEXT (FK → packets.id, CASCADE) | |
| entry_date | TEXT | Date of the entry (YYYY-MM-DD) |
| content | TEXT | Journal text |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

### `todos`
16 default rows seeded per packet, tracked by the student.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, AUTO) | |
| packet_id | TEXT (FK → packets.id, CASCADE) | |
| title | TEXT (NOT NULL) | To-do item title |
| description | TEXT | Optional details |
| category | TEXT | `interviews`, `scheduling`, `escort`, `clothing`, `travel`, `spiritual` |
| sort_order | INTEGER | Display order |
| completed | INTEGER | 0 or 1 |
| completed_at | TEXT | Completion timestamp |

## Relationships

```
packets (1) ──── (3) goals
packets (1) ──── (1) escorts
packets (1) ──── (4) reflections
packets (1) ──── (N) journal_entries
packets (1) ──── (16) todos
```

All child tables cascade delete when a packet is deleted.
