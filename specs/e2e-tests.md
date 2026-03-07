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
