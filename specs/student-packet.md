# Student Packet Page Specification

## Route

`/p/:uuid` — Public, no authentication required.

## Design Principles

- **Mobile-first**: Designed for phone screens (375px+), scales up to desktop
- **Touch-friendly**: All interactive elements have minimum 44px tap targets
- **Auto-save**: Text inputs debounce and save automatically (1 second delay)
- **Warm aesthetic**: Cream background, serif headers (EB Garamond), gold/blue accent colors
- **Sacred tone**: Respectful of the spiritual nature of the content

## Sections (in scroll order)

### 1. Cover Page
- Student's name large and centered
- Title: "Your Temple Preparation Packet"
- Scripture: D&C 97:15–16 in italics
- Decorative divider

### 2. Congratulations
- Heading: "Congratulations"
- Custom message from admin, or default: "Congratulations on completing the Temple Preparation course! This is a wonderful milestone on your covenant journey."
- Brief encouragement about what lies ahead

### 3. Instructor's Testimony
- Heading: "A Word from Your Instructor"
- Testimony text from admin
- Instructor's name at the bottom

### 4. Personal Note
- Heading: "A Personal Note for You"
- Only shown if admin provided one
- Styled as a handwritten-feel card (slightly different background, italic)

### 5. Goal Setting
- Heading: "Your Path to the Temple"
- Three goal rows, each with:
  - Label (e.g., "Recommend Interview with Bishop")
  - Date input (type="date")
  - Completion checkbox
- `data-testid="goal-{goal_type}"` on each row
- Changes saved on blur/change

### 6. Temple Escort
- Heading: "Your Temple Escort"
- Brief explanation: "A temple escort is an endowed member of the same sex who will accompany you during your first temple visit. They will sit with you and help guide you through your endowment."
- Input fields: Name, Phone, Email, Relationship
- Auto-save on blur (debounced)
- Labels with `htmlFor` for accessibility

### 7. Spiritual Preparation Resources
- Heading: "Prepare Your Heart and Mind"
- Sub-heading: "General Conference Talks"
  - 5 talk cards, each showing: speaker, title, conference, 1-line summary, link, QR code
- Sub-heading: "Key Scriptures"
  - 7 scripture cards, each showing: reference, theme, link, QR code
- Links open in new tab (`target="_blank"`)
- QR codes rendered with `qrcode.react` at 80x80px
- `data-testid="qr-{index}"` on each QR code

### 8. Reflection Questions
- Heading: "Prepare to Approach the Lord"
- 4 questions, each with:
  - Question text in bold
  - Textarea for response
  - Auto-save with 1s debounce
- `data-testid="reflection-{question_key}"` on each textarea

### 9. Temple Journal
- Heading: "Record Your Temple Experience"
- "Add Entry" button
- Each entry: date input + textarea + save/delete buttons
- `data-testid="journal-content"` on textareas
- Entries displayed in reverse chronological order

### 10. What to Expect
- Heading: "Your Temple Day"
- Numbered steps (non-sacred summary):
  1. Arrive at the temple in Sunday attire at the scheduled time
  2. Meet briefly with a member of the temple presidency
  3. Go to the dressing room and change into white clothing and garments
  4. Receive the initiatory ordinance (a brief, sacred preparation ~5-10 min)
  5. Receive your endowment alongside your escort
  6. Enter the Celestial Room — remain as long as you'd like
- Closing note: "Do not try to understand it all at once. Pay attention to what the Spirit will be telling you, and take your time to approach the Lord in the Celestial Room."

### 11. To-Do Checklist
- Heading: "Preparation Checklist"
- Progress indicator: "X of 16 complete" with a progress bar
- `data-testid="todo-progress"` on progress element
- Grouped by category (Interviews, Scheduling, Escort, Clothing, Travel, Spiritual)
- Each item: checkbox + title + optional description
- `data-testid="todo-{id}"` on each item wrapper
- Checking saves immediately via API

### 12. Useful Contacts
- Heading: "Your Contacts"
- Contact cards for: Bishop, Executive Secretary, Ministering Brothers, Ministering Sisters, Instructor
- Phone numbers as `tel:` links (tappable on mobile)
- Email addresses as `mailto:` links
- Ministering contacts: may have multiple people per group

### 13. Closing Encouragement
- Brief closing message
- Quote: "As often as you return, you'll learn more and more and all will become very familiar to you."
- Final encouragement to attend regularly

## Section Navigation

- Fixed bottom bar (mobile) or sidebar (desktop) with section shortcuts
- Tapping a shortcut smooth-scrolls to that section
- Hidden during print
- `class="no-print"` applied

## Error States

- **Packet not found**: Friendly message with temple illustration, "This packet was not found. Please check the link you received."
- **Network error**: Toast/banner with retry option
- **Save failure**: Inline error near the field that failed
