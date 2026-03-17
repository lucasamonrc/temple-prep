# E2E Test Plan — Acceptance Criteria

## Test Environment

- Playwright with Chromium, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- Frontend at `http://localhost:5173`
- Worker at `http://localhost:8787`
- Default PIN: `1234`

## Admin Portal Tests (`e2e/admin.spec.ts`)

### AC-01: Admin Login — Correct PIN
- Navigate to `/admin`
- Enter correct PIN → submit
- Verify redirect to `/admin/dashboard`

### AC-02: Admin Login — Incorrect PIN
- Navigate to `/admin`
- Enter wrong PIN → submit
- Verify error message visible
- Verify still on `/admin`

### AC-03: Create Student Packet
- Login → navigate to create form
- Fill required fields (student name, bishop info)
- Save → verify redirect to dashboard
- Verify packet appears in list

### AC-04: Edit Student Packet
- Login → click edit on existing packet
- Change student name → save
- Verify updated name in dashboard

### AC-05: Delete Student Packet
- Login → click delete on existing packet
- Confirm deletion
- Verify packet removed from list
- Verify student URL returns not-found

### AC-06: Preview Student Packet
- Login → click preview on existing packet
- Verify student packet renders with admin-provided data

## Student Packet Tests (`e2e/student-packet.spec.ts`)

### AC-07: Student Page Loads
- Navigate to `/p/{uuid}`
- Verify student name on cover page
- Verify all 13 sections are present

### AC-08: Invalid UUID
- Navigate to `/p/nonexistent-uuid`
- Verify "not found" message

### AC-09: Goal Setting
- Set a date for bishop interview
- Mark as complete
- Reload → verify date and completion persist

### AC-10: Escort Information
- Fill in escort name and phone
- Reload → verify info persists

### AC-11: Reflection Questions
- Type a response for "ask_lord" question
- Wait for auto-save (debounce)
- Reload → verify response persists

### AC-12: Temple Journal
- Create a new journal entry with content
- Save → reload → verify entry persists

### AC-13: To-Do Checklist
- Check 3 items
- Verify progress indicator shows 3
- Reload → verify items remain checked

### AC-14: Spiritual Resources
- Verify 5 talk cards visible with titles
- Verify 7 scripture cards visible with references
- Verify QR codes rendered
- Verify links contain churchofjesuschrist.org URLs

### AC-15: Contacts — Tappable
- Verify bishop name visible
- Verify phone numbers are `tel:` links

### AC-16: Mobile Responsiveness
- Set viewport to 375x667
- Navigate to student packet
- Verify no horizontal scroll (body scrollWidth <= viewport width)

### AC-17: Section Navigation
- Verify bottom nav bar exists
- Tap a section shortcut → verify scroll position changes

## Student Lookup Tests (`e2e/student-lookup.spec.ts`)

### AC-18: Student Lookup — Correct Credentials
- Navigate to `/`
- Enter first name, last name, and PIN
- Submit → verify redirect to `/p/:uuid`
- Verify student name visible on packet

### AC-19: Student Lookup — Wrong PIN
- Navigate to `/`
- Enter correct name, wrong PIN
- Submit → verify error message displayed
- Verify still on `/`

### AC-20: Student Lookup — Wrong Name
- Navigate to `/`
- Enter wrong name, correct PIN
- Submit → verify error message displayed

### AC-21: Student Lookup — Case-Insensitive Name
- Create packet for "Lookup Testuser" with PIN
- Navigate to `/`
- Enter lowercase "lookup" / "testuser" with correct PIN
- Submit → verify redirect to packet page

### AC-22: Admin — PIN Field in Packet Form
- Login → navigate to edit form for a packet with a PIN
- Verify PIN input field is visible and populated with the correct value

### AC-23: Admin — PIN Visible on Dashboard
- Login → verify at least one packet shows its PIN on the dashboard

## PDF Generation Tests (`e2e/pdf-generation.spec.ts`)

### AC-24: Print Route Renders Full Packet
- Navigate to `/print/{uuid}` for a valid packet
- Verify all 13 section headings present
- Verify packet-specific content (testimony, bishop name, etc.)

### AC-25: Print Route is Non-Interactive
- Navigate to `/print/{uuid}`
- Verify no section navigation bar
- Verify all checkboxes, textareas, and date inputs are disabled
- Verify no "Add Entry" button for journal

### AC-26: Generate PDF Button Visible When No PDF Exists
- Login → dashboard
- Verify "Generate PDF" button visible on packet card
- Button has `data-testid="pdf-generate-{id}"`

### AC-27: Clicking Generate PDF Triggers API Call
- Click "Generate PDF" button
- Verify POST request to `/api/admin/packets/:id/pdf` is made

### AC-28: Generating Status Displayed (Mocked)
- Mock packet list API to return `pdf_status: "generating"`
- Verify "Generating..." badge visible on packet card

### AC-29: Download Button Appears When PDF Ready (Mocked)
- Mock packet list API to return `pdf_status: "ready"` with `pdf_generated_at` after `updated_at`
- Verify "Download PDF" button visible

### AC-30: Outdated Badge After Packet Update (Mocked)
- Mock packet list API to return `pdf_status: "ready"` with `updated_at` after `pdf_generated_at`
- Verify "Outdated" badge and "Regenerate" button visible

### AC-31: Error State With Retry Button (Mocked)
- Mock packet list API to return `pdf_status: "error"`
- Verify "Error" badge and "Retry" button visible

### AC-32: POST Triggers PDF Generation
- POST `/api/admin/packets/:id/pdf` with valid auth
- Verify 202 response with `{ status: "pending", workflow_id: "..." }`

### AC-33: GET Returns 404 When PDF Not Ready
- GET `/api/admin/packets/:id/pdf` when no PDF is ready
- Verify 404 response

### AC-34: Packet List Includes PDF Status
- GET `/api/admin/packets` after triggering PDF generation
- Verify response includes `pdf_status` field per packet

### AC-35: Deleting Packet Removes PDF Job
- Create packet, trigger PDF generation, delete packet
- Verify packet is fully removed (404 on GET)
