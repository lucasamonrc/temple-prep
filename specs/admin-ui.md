# Admin UI Specification

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | Login | PIN entry form |
| `/admin/dashboard` | Dashboard | List all packets, create new |
| `/admin/packets/new` | PacketForm | Create a new packet |
| `/admin/packets/:id` | PacketForm | Edit existing packet |
| `/admin/packets/:id/preview` | PacketPreview | Preview as student sees it |

## Login Page (`/admin`)

- Simple, centered PIN input
- PIN stored in `sessionStorage` as `admin_pin` on success
- Redirect to `/admin/dashboard` on success
- Show error message on failure
- `inputMode="numeric"` for mobile number pad

## Dashboard (`/admin/dashboard`)

- Page header: "Temple Prep — Instructor Portal"
- "Create New Packet" button → navigates to `/admin/packets/new`
- Table/list of all packets showing:
  - Student name
  - Created date
  - Last updated date
  - Actions: Edit, Preview, Copy Link, Delete
- "Copy Link" copies the student URL `/p/{uuid}` to clipboard
- "Delete" shows a confirmation dialog before proceeding
- Each packet card/row also shows a small QR code for the student link

## Packet Form (`/admin/packets/new` and `/admin/packets/:id`)

Shared form for create and edit. When `:id` is present, pre-fill from API.

### Form Sections

**Student Info:**
- Student Name (required)

**Your Message:**
- Congratulations Message (textarea, optional — uses default if empty)
- Personal Testimony (textarea)
- Personal Note to Student (textarea)

**Temple:**
- Temple Name (pre-filled: "San Antonio Texas Temple")
- Temple Phone (pre-filled: "(210) 937-5100")
- Temple URL (pre-filled)

**Contacts — Bishop:**
- Name, Phone, Email

**Contacts — Executive Secretary:**
- Name, Phone, Email

**Contacts — Ministering Brothers:**
- Dynamic list: add/remove entries, each with Name + Phone

**Contacts — Ministering Sisters:**
- Dynamic list: add/remove entries, each with Name + Phone

**Contacts — Instructor (You):**
- Name, Phone, Email

### Actions
- "Save" — Creates or updates the packet, redirects to dashboard
- "Cancel" — Returns to dashboard without saving

## Packet Preview (`/admin/packets/:id/preview`)

- Renders the student packet page with the admin-provided data
- Read-only (interactive features disabled)
- Shows a banner at the top: "Preview Mode — This is how the student will see their packet"
- Button to go back to editing
