# Make.com Automation Templates — Reference Guide
## Deployment + Configuration Summary for Lübeck Clients

_This is the client-facing reference. For full technical specs, see `.cowork/tech/make_automation_patterns.md`._

---

## TEMPLATE LIBRARY OVERVIEW

| # | Template Name | Segment | Deploy Time | Complexity | Monthly Value |
|---|--------------|---------|-------------|------------|---------------|
| 1 | Reservierungs-Aggregation | Gastro | 2–3 days | Low | €+800/month base |
| 2 | Schicht-Automation | Gastro | 3–5 days | Medium | €+1,200/month |
| 3 | Job-Dispatch-Automation | Handwerk | 3–5 days | Medium | €+800/month |
| 4 | Invoice-Real-Time | Handwerk | 2–3 days | Medium | €+700/month |
| 5 | Feedback-Collection | Both | 1–2 days | Low | €+300/month add-on |

---

## TEMPLATE #1: RESERVIERUNGS-AGGREGATION (Gastro)

**What the client gets:**
- All reservations (website form, Google Business, email) flow into one Google Sheet automatically
- Guest receives instant WhatsApp/SMS confirmation
- Staff WhatsApp group notified of every new booking
- 24h reminder automatically sent to guest before visit

**What the client provides (checklist):**
- [ ] Google account with Google Sheets access
- [ ] WhatsApp Business number (or approval to set one up)
- [ ] Staff WhatsApp group number OR create new group with Henri

**What Henri configures:**
- [ ] Make.com webhook URL → enter into client website form
- [ ] Google Forms trigger (if no website form available)
- [ ] WhatsApp Business API connection (Twilio or 360dialog account)
- [ ] Confirmation message template (customize with business name)
- [ ] Staff notification template
- [ ] Reminder sub-scenario (separate Make.com scenario, scheduled daily 8am)

**Go-live test:**
1. Submit a test reservation from the website
2. Confirm it appears in Google Sheet
3. Confirm confirmation WhatsApp received (test number)
4. Confirm staff WhatsApp notified
5. Confirm next-day trigger sends reminder

---

## TEMPLATE #2: SCHICHT-AUTOMATION (Gastro)

**What the client gets:**
- Staff submit availability via Google Form (once per week)
- Schedule generated automatically every Friday 6pm
- Each staff member receives their personal schedule via WhatsApp
- Manager receives the full week plan + link to Google Sheet

**What the client provides:**
- [ ] Google account for Forms + Sheets
- [ ] Staff WhatsApp numbers (full list)
- [ ] Shift rules: minimum staff per shift (lunch vs dinner), maximum hours/week
- [ ] List of staff with roles (senior, junior — for Sunday assignment rule)

**What Henri configures:**
- [ ] Google Form (Availability Form) — shared with staff
- [ ] Scheduling logic in Make.com (iterator + aggregator modules)
- [ ] Friday 6pm scheduled trigger
- [ ] Per-staff WhatsApp send (iterator over staff array)
- [ ] Manager summary send

**Limitation to communicate to client:**
_"This system works well for consistent shift types (lunch/dinner). For very complex scheduling with many exceptions, there may be an occasional manual adjustment needed — but these are rare."_

---

## TEMPLATE #3: JOB-DISPATCH-AUTOMATION (Handwerk)

**What the client gets:**
- New job entered via Google Form (owner or admin)
- Automatically routed to the right technician based on job type
- Technician receives WhatsApp with: job details, client address, Google Maps link
- Job added to technician's Google Calendar
- Optional: client receives SMS confirmation

**What the client provides:**
- [ ] Google account (Forms + Sheets + Calendar)
- [ ] Technician list: name, WhatsApp number, specialty/Gewerk
- [ ] Routing rules: which technician handles which job type
- [ ] Agreement on "done" signal (WhatsApp bot message or form)

**What Henri configures:**
- [ ] Google Form (New Job Form)
- [ ] Router module (job type → technician mapping)
- [ ] WhatsApp send per technician
- [ ] Google Calendar event creation
- [ ] Google Maps link auto-generation from address
- [ ] Optional: Client SMS notification

**Common customization requests:**
- "Add priority flag for emergency jobs" → add "Priority" field to form + different WhatsApp message template
- "Show next 3 upcoming jobs to each tech" → add daily 7am summary scenario

---

## TEMPLATE #4: INVOICE-REAL-TIME (Handwerk)

**What the client gets:**
- Technician signals job completion (WhatsApp bot or Google Form)
- Invoice auto-generated as PDF with job details pre-filled
- Invoice emailed to client immediately
- Optional: Payment link included in invoice email
- 14-day payment reminder sent automatically if unpaid

**What the client provides:**
- [ ] Invoice template (we provide a Google Docs template, client customizes header/logo)
- [ ] Client contact list (email addresses for invoicing)
- [ ] Job details structure (what appears on invoice: materials, hours, job description)
- [ ] Bank details / payment info for invoice footer
- [ ] Optional: Stripe or Mollie account for payment link generation

**What Henri configures:**
- [ ] "Done" signal trigger (WhatsApp keyword or Google Form)
- [ ] Google Sheets job lookup (match job_id → client + details)
- [ ] Google Docs template merge (fill invoice fields)
- [ ] PDF conversion + Google Drive save
- [ ] Email send with PDF attachment
- [ ] +14 day payment reminder scenario

**Accounting software integration (if needed):**
- Lexware: Make.com has Lexware integration — invoice can be pushed directly
- DATEV: Requires export CSV → more manual, discuss with client
- None: PDF + email + manual tracking in Sheets works for <30 invoices/week

---

## TEMPLATE #5: FEEDBACK-COLLECTION (Both Segments)

**What the client gets:**
- Automated satisfaction survey sent 2–24h after service completion
- Positive ratings (4–5) → automatic Google review request
- Negative ratings (1–3) → immediate owner alert via WhatsApp
- All feedback logged in Google Sheets dashboard

**What the client provides:**
- [ ] Client/guest phone numbers (from existing reservation or job data)
- [ ] Google Business profile link (for review redirect)
- [ ] Owner WhatsApp number (for negative alert)
- [ ] Preference: 3-click survey (simple) or 5-star Google Form

**What Henri configures:**
- [ ] Trigger: new "Completed" status in master Sheets
- [ ] Delay module (2h for Gastro, 24h for Handwerk)
- [ ] Twilio SMS send (survey link)
- [ ] Google Forms: simple 1–5 rating + optional comment
- [ ] Router: rating ≥ 4 → review request SMS; rating ≤ 3 → owner WhatsApp alert
- [ ] Feedback log in Sheets

---

## DEPLOYMENT PROCESS (All Templates)

**Step 1 — Pre-kickoff (Luc + client)**
- Confirm which template(s) to deploy
- Collect all "What the client provides" items above
- Set go-live date expectation: X business days after kickoff call

**Step 2 — Kickoff Call (45 min, Luc + Henri + client)**
- Luc introduces Henri: "Henri ist unser Technik-Experte und baut Ihr System."
- Henri asks clarifying questions (routing rules, message templates, etc.)
- Luc and client agree on any business logic details

**Step 3 — Build (Henri, 2–5 days)**
- Clone master Make.com scenario
- Configure all variables
- Internal test with dummy data
- Fix errors

**Step 4 — Client Test (Henri sends test, Luc confirms with client)**
- Submit 1 test transaction (reservation, job, etc.)
- Client + Luc verify all outputs (WhatsApp received, Sheet updated, etc.)
- Sign off verbally or by email: "Läuft alles — wir gehen live."

**Step 5 — Go-Live + Monitor (48h)**
- Henri monitors Make.com for errors
- Luc follows up with client after Day 1 and Day 3

**Step 6 — Handover + Documentation**
- Henri documents client-specific config in their Google Drive folder
- Luc sends client a simple 1-page "So funktioniert Ihr System" summary

---

## PRICING REFERENCE

| Setup | Standard | With HWK Discount |
|-------|----------|-------------------|
| 1 template | €600–800 | €480–640 |
| 2 templates | €900–1,200 | €720–960 |
| Full package (3–5) | €1,200–1,800 | €960–1,440 |

Monthly retainers: See `proposal_template.md` — Section "Investition"
