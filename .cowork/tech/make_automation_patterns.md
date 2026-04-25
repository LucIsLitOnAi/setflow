# Make.com Automation Patterns
## 5 Core Workflows for Lübeck Clients

---

## OVERVIEW

These are the 5 reusable Make.com scenario templates. Each is documented as a step-by-step workflow description. When Henri builds the actual Make.com scenario, use these as the spec.

**Template versioning:** Each deployed client gets a copy of the template (not the master). Updates to the master template should be communicated to existing clients if the improvement is significant.

---

## WORKFLOW #1: Reservierungs-Aggregation (Gastro)

**Use case:** Restaurant/hotel collects reservations from multiple channels → unified view → instant guest confirmation  
**Segment:** Gastro (restaurants, hotels, cafés with reservations)  
**Deployment time:** 2–3 days

### Trigger Options (pick 1 or more)
- **Webhook** — for website contact forms (form submits → JSON payload to Make.com webhook URL)
- **Google Forms watch** — for simple reservation forms (Make.com polls every 15 min)
- **Email parsing** — Gmail watch → filter by subject "Reservation" or "Tisch buchen" → parse fields

### Modules (in order)

```
1. TRIGGER: Webhook / Google Forms / Gmail watch
   ↓
2. PARSE: Extract fields → {name}, {date}, {time}, {guests}, {phone}, {email}, {special_requests}
   ↓
3. GOOGLE SHEETS: Add row to "Reservations" tab
   → Columns: ID | Date | Time | Name | Guests | Phone | Email | Source | Status | Notes
   ↓
4. FILTER: Is the reservation slot already booked? 
   → Google Sheets search for same date/time with overlapping covers
   → If conflict: jump to module 8 (conflict notification)
   ↓
5. WHATSAPP / SMS: Send confirmation to guest
   → Template: "Hallo {name}! Wir freuen uns auf Ihren Besuch am {date} um {time} 
   Uhr für {guests} Personen. Bei Fragen: [phone]. [Business Name]"
   ↓
6. GOOGLE SHEETS: Update row status → "Confirmed"
   ↓
7. NOTIFICATION: Send WhatsApp to staff group
   → "Neue Reservierung: {name}, {guests} Personen, {date} {time}"
   ↓
8. (ERROR PATH) WHATSAPP to owner: "Konflikt bei Reservierung {date} {time} — bitte prüfen"
```

### Reminder Sub-workflow (linked scenario)
- Trigger: Google Sheets → scheduled trigger, daily at 8am
- Filter: Find all reservations for today
- Action: Send WhatsApp reminder to each guest (24h before) — "Erinnerung: Ihr Tisch bei [X] heute um {time} Uhr. Bitte geben Sie Bescheid falls Sie nicht kommen können: [phone]"

### Error Handling
- If WhatsApp fails: fallback to SMS via Twilio
- If Sheets write fails: retry 3x, then email owner@[business].de with reservation data
- Log all errors to a separate "Errors" tab in the same Google Sheet

### Variables to Configure per Client
- `WEBHOOK_URL` — client website form target
- `WHATSAPP_NUMBER_STAFF` — staff WhatsApp group number
- `BUSINESS_NAME` — used in all messages
- `OWNER_EMAIL` — for error notifications
- `COVERS_PER_TIMESLOT` — max simultaneous reservations

---

## WORKFLOW #2: Schicht-Automation (Gastro)

**Use case:** Staff submit availability → automated weekly schedule generated → sent to each employee  
**Segment:** Gastro  
**Deployment time:** 3–5 days (rules configuration adds time)

### Process Flow

```
1. TRIGGER: Google Forms submission (staff submits availability)
   → Form fields: {name}, {week_of}, {available_days[]}, {available_shifts[]}
   ↓
2. GOOGLE SHEETS: Log availability to "Availability" tab
   ↓
3. SCHEDULED TRIGGER: Every Friday 6pm — run schedule generation
   ↓
4. GOOGLE SHEETS: Read all availability for next week
   ↓
5. MAKE.COM ITERATOR + AGGREGATOR: Build schedule
   → Rules (configured per client):
     - Minimum 2 staff per lunch shift, 3 per dinner
     - No staff works more than 5 days/week
     - Senior staff required on Saturday + Sunday
     - Honor "unavailable" flags from form
   ↓
6. GOOGLE SHEETS: Write schedule to "Schedule_{week}" tab
   ↓
7. FOR EACH STAFF MEMBER:
   → Filter their assigned shifts
   → WhatsApp: "Dein Plan für {week_of}: Mo-Mittag, Di-Abend, Fr-Abend, Sa-Mittag"
   ↓
8. WHATSAPP to manager: "Wochenplan für {week_of} fertig — Link: {sheets_url}"
```

### Known Limitations
- Make.com can't do complex constraint optimization. For simple rules (min/max staff per shift), it works. For complex optimization (prefer employee A before B for Sundays), use a Google Apps Script function instead and trigger it from Make.com.
- Communicate to clients: this replaces the manual WhatsApp chaos, not a full scheduling software.

### Variables to Configure per Client
- `MIN_STAFF_LUNCH`, `MIN_STAFF_DINNER` — staffing rules
- `STAFF_LIST` — array of all staff WhatsApp numbers + names
- `MANAGER_WHATSAPP` — manager receives final schedule + alert

---

## WORKFLOW #3: Job-Dispatch-Automation (Handwerk)

**Use case:** New job arrives → auto-routed to right technician → job in calendar  
**Segment:** Handwerk  
**Deployment time:** 3–5 days

### Process Flow

```
1. TRIGGER: Google Form submission (owner or admin logs new job)
   → Fields: {client_name}, {address}, {job_type}, {priority}, {preferred_date}, {notes}
   ↓
2. GOOGLE SHEETS: Add job to "Jobs" tab
   → Status: "New"
   ↓
3. ROUTER: Route based on {job_type}
   → Elektro jobs → Technician A
   → SHK jobs → Technician B  
   → General → check availability (see step 4)
   ↓
4. GOOGLE SHEETS: Check technician availability for {preferred_date}
   → If available: proceed
   → If not available: notify owner, suggest next free date
   ↓
5. WHATSAPP to assigned technician:
   "Neuer Auftrag: {job_type} bei {client_name}
   Adresse: {address}
   Datum: {preferred_date}
   Notizen: {notes}
   Maps: [auto-generated Google Maps link from address]"
   ↓
6. GOOGLE CALENDAR: Create event for technician
   → Title: "{job_type} — {client_name}"
   → Description: full job details
   → Location: {address}
   ↓
7. GOOGLE SHEETS: Update job status → "Dispatched"
   ↓
8. OPTIONAL: SMS to client
   "Ihr Auftrag wurde bestätigt. [Technician name] kommt am {date}."
```

### Variables to Configure per Client
- `TECHNICIAN_ROUTING_RULES` — which job types go to which technician
- `TECHNICIAN_NUMBERS[]` — WhatsApp number for each technician
- `CLIENT_NOTIFICATION_ENABLED` — true/false (some clients don't want this)
- `CALENDAR_IDs[]` — Google Calendar ID for each technician

---

## WORKFLOW #4: Invoice-Real-Time (Handwerk)

**Use case:** Job completed → invoice generated and sent same day  
**Segment:** Handwerk  
**Deployment time:** 2–3 days

### Process Flow

```
1. TRIGGER: WhatsApp bot (technician sends "DONE {job_id}" to WhatsApp Business number)
   OR Google Form submission (simpler alternative)
   ↓
2. MAKE.COM: Look up job details in Google Sheets using {job_id}
   → Pull: client name, address, job description, hours logged, materials used
   ↓
3. INVOICE GENERATION (two options):
   Option A: Make.com + Google Docs template fill + export as PDF
   Option B: Make.com + Lexware/Billomat API (if client already uses accounting software)
   ↓
4. GOOGLE DRIVE: Save invoice PDF to client folder
   ↓
5. EMAIL: Send invoice to client
   → Subject: "Rechnung {invoice_number} — {job_type} vom {date}"
   → Body: "Anbei Ihre Rechnung. Zahlung innerhalb von 14 Tagen. Bei Fragen: {phone}"
   → Attachment: PDF
   ↓
6. OPTIONAL WHATSAPP to client:
   "Ihre Rechnung für den heutigen Auftrag finden Sie in Ihrer E-Mail. 
   Bei Fragen rufen Sie uns an: {phone}"
   ↓
7. GOOGLE SHEETS: Update job → "Invoiced", log invoice date + number
   ↓
8. FOLLOW-UP TRIGGER (scheduled, +14 days):
   → Check if payment received (manual update in Sheets)
   → If not paid: send payment reminder email + WhatsApp
```

### Variables to Configure per Client
- `INVOICE_TEMPLATE_ID` — Google Docs template ID with {variables}
- `ACCOUNTING_SOFTWARE` — none / Lexware / Billomat / DATEV
- `PAYMENT_TERMS_DAYS` — 14 / 30 days
- `CLIENT_EMAIL_MAP` — Google Sheet with client ID → email address

---

## WORKFLOW #5: Feedback-Collection (Both Segments)

**Use case:** Post-job feedback → Google review request for happy customers → owner alert for unhappy  
**Segment:** Both (Gastro + Handwerk)  
**Deployment time:** 1–2 days

### Process Flow

```
1. TRIGGER: Google Sheets watch — new row in "Completed Jobs/Reservations" with status "Done"
   ↓
2. DELAY: Wait 2 hours (Gastro) or 24 hours (Handwerk) after completion
   ↓
3. TWILIO SMS to client/guest:
   "Wie war Ihre Erfahrung bei [Business Name]? 
   Super: [link1] | Okay: [link2] | Nicht gut: [link3]"
   (3-click survey via simple redirect links to Google Forms)
   ↓
4. GOOGLE FORMS: Client submits rating (1–5) + optional comment
   ↓
5. ROUTER: Based on rating
   → Rating 4–5:
     → SMS: "Vielen Dank! Könnten Sie uns eine Google-Bewertung hinterlassen? 
              [Google Maps review link]"
   → Rating 1–3:
     → Owner WhatsApp alert: "Negative Bewertung von {client} ({rating}/5): '{comment}'"
     → Sheets: log as "Complaint" — owner must follow up
   ↓
6. GOOGLE SHEETS: Log all feedback to "Feedback" tab
   → Columns: Date | Client | Rating | Comment | Review Left? | Owner Follow-up
```

### Variables to Configure per Client
- `DELAY_HOURS` — 2 for Gastro, 24 for Handwerk
- `GOOGLE_REVIEW_LINK` — client's Google Maps review URL
- `OWNER_WHATSAPP` — for negative rating alerts
- `ALERT_THRESHOLD` — ratings below this number trigger alert (default: 3)

---

## TEMPLATE DEPLOYMENT CHECKLIST

When deploying any template for a new client:

- [ ] Clone master scenario in Make.com (never edit master)
- [ ] Rename: "[ClientName] — [Workflow Name]"
- [ ] Update all variables (webhook URLs, WhatsApp numbers, Sheets IDs)
- [ ] Test with dummy data: trigger → check all steps complete without error
- [ ] Test error path: what happens if WhatsApp fails?
- [ ] Set up error notification email (owner alerts)
- [ ] Document client-specific customizations in their project folder
- [ ] Activate scenario + monitor for first 48 hours
- [ ] Client sign-off call (15 min): confirm they see data flowing into Sheets
