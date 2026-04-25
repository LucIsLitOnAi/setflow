# Segment A — Gastronomie Playbook
## Lübeck Hotels, Restaurants, Cafés

---

## SEGMENT OVERVIEW

| Property | Detail |
|----------|--------|
| Market size | ~250–300 businesses in Lübeck |
| Target profile | Hotels (10–80 rooms), restaurants (30–150 covers), cafés (full-service) |
| Decision maker | Inhaber (owner-operator), sometimes F&B Manager in hotels |
| Avg deal size | €500–1,500/month retainer + €500–800 setup fee |
| Sales cycle | 2–4 weeks (owner decides fast when pain is real) |
| Primary language | German; some English for international hotel brands |

---

## PAIN POINTS (by priority)

1. **Reservation chaos** — phone calls, emails, Google Bookings, walk-ins all managed manually. Staff forget to update the sheet. Tables double-booked on busy nights.
2. **No-shows** — 10–20% no-show rate costs €30–80/table/night. Zero automated follow-up or reminder system.
3. **Staff scheduling** — Sunday chaos: who works Friday? Who called in sick? WhatsApp groups are the "system."
4. **After-hours inquiries** — Questions come in at midnight. No one answers. Guest books somewhere else.
5. **Google reviews** — Staff don't ask for them. Google score languishes at 4.1 when the experience deserves 4.6.

---

## USE CASES (sorted by ease of deployment)

### 1. Reservierungs-Aggregation (Deployment: 2–3 days)
**What it does:** Pulls reservations from all sources (Google Business, website form, email) into one Google Sheet. Auto-sends confirmation WhatsApp/SMS to guest. Notifies staff via WhatsApp group.

**Value pitch:** "Your staff have one place to look. No more double-bookings. Guests get instant confirmation."

**Tech:** Make.com + Google Sheets + WhatsApp Business API (or Twilio SMS)  
**Complexity:** Low — 3 Make.com modules, 1 Google Sheet, 1 webhook  
**Template:** `.cowork/tech/make_automation_patterns.md` — Workflow #1

**Pricing:** Included in standard retainer (€800–1,200/month)

---

### 2. No-Show Reduction (Deployment: 1–2 days)
**What it does:** 24h before reservation → automated WhatsApp reminder sent. 2h before → second reminder. No-show → auto-follow-up to rebook.

**Value pitch:** "Our clients cut no-show rate from ~15% to under 5%. That's 2–4 recovered covers per week."

**Tech:** Make.com + Google Sheets (existing reservation data) + Twilio or WhatsApp API  
**Complexity:** Low  
**Template:** Variant of Workflow #1

**Pricing:** Add-on €200/month or included in growth tier

---

### 3. Schicht-Automation (Deployment: 3–5 days)
**What it does:** Staff fill in Google Form (availability for next week). Make.com builds schedule based on rules (min staff per shift, max hours). Sends each staff member their shifts via WhatsApp.

**Value pitch:** "Stop spending 3 hours every Sunday night building the rota. It builds itself."

**Tech:** Make.com + Google Forms + Google Sheets + WhatsApp API  
**Complexity:** Medium — needs rules setup per client (shift types, min/max)  
**Template:** `.cowork/tech/make_automation_patterns.md` — Workflow #2

**Pricing:** Standard retainer (€1,000–1,500/month) — this one is a strong upsell

---

### 4. Google Review Automation (Deployment: 1 day)
**What it does:** 2 hours after a reservation end time → SMS to guest: "Hope you enjoyed your meal! Leave us a review 🙏 [Google link]"

**Value pitch:** "Our clients see 40–60% more Google reviews within 6 weeks. Rating typically improves 0.2–0.3 points."

**Tech:** Make.com + Google Sheets (reservation data) + Twilio SMS  
**Complexity:** Very low  
**Template:** Variant of Feedback Collection workflow

**Pricing:** Add-on €150/month — easy upsell once basic workflows are live

---

### 5. After-Hours Inquiry Bot (Deployment: 5–7 days)
**What it does:** WhatsApp Business auto-reply for common questions (hours, menu, reservation availability). Logs all inquiries to Sheets for next-morning follow-up.

**Value pitch:** "Never lose a guest because no one replied at 10pm."

**Tech:** WhatsApp Business API + Make.com + optionally a basic Claude/GPT API call for dynamic responses  
**Complexity:** Medium-High  
**Pricing:** Growth tier only (€1,500–2,500/month) — reserve for larger hotels

---

## SALES PROCESS

**Step 1: Outreach**
- Email: use `luebeck/sales/gastro_cold_outreach_script.md`
- WhatsApp: shorter version (3–4 lines max), personalized to the business
- Best timing: Tuesday–Thursday, 10–11am or 2–3pm (avoid Monday morning + Friday afternoon)

**Step 2: Discovery Call (20–30 min)**
Goals:
- Understand their current reservation system
- Quantify their no-show rate (ask: "How many covers do you turn away per week due to no-shows?")
- Find out who manages staff scheduling and how long it takes them
- Identify their biggest operational pain point (they'll tell you if you ask)

Questions to ask:
- "How do you currently handle reservations from different channels?"
- "What happens when a guest doesn't show up — do you do anything?"
- "How long does it take you to build the weekly staff rota?"
- "How many Google reviews did you get last month?"

**Step 3: Proposal (same day)**
- Use `luebeck/sales/proposal_template.md`
- Lead with the pain point they mentioned most
- Recommend 1–2 workflows max (not all 5 — keep it simple)
- Show ROI: "If we reduce no-shows from 15% to 5% on 100 covers/week at €25 avg spend, that's €2,500/month recovered. We cost €800/month."

**Step 4: Contract + Onboarding**
- Contract: 3-month minimum, then monthly rolling
- Payment: upfront setup fee + monthly invoice (auto via Stripe from Month 4+)
- Kickoff call: 45 min with owner to configure workflows (Henri attends)
- Go-live: within 5 business days of kickoff call

---

## OBJECTION HANDLING

| Objection | Response |
|-----------|----------|
| "Wir haben das immer so gemacht." | "Verstehe ich. Die ersten 2 Wochen dauert die Umstellung. Danach spart das X Stunden pro Woche — unbegrenzt." |
| "Zu teuer." | "Was kostet Ihr 1 Stunde Mitarbeiterzeit? Wir sparen Ihnen 6–8 Stunden pro Woche. Das ist mindestens €120–160/Woche — wir kosten €200/Woche." |
| "Ich muss das erst mit meinem Team besprechen." | "Klar. Darf ich bis Donnerstag nachfragen? Ich kann auch gerne einen kurzen Demo-Call für Ihr Team machen." |
| "Was passiert wenn das System ausfällt?" | "Alle Daten landen in Ihrer Google Sheets — Sie sehen alles immer. Bei technischem Problem: Wir reagieren innerhalb von 4 Stunden." |
| "Wir haben keinen WhatsApp Business Account." | "Das richten wir mit ein — dauert 1 Tag, kostet nichts extra." |

---

## TARGET BUSINESSES (Lübeck)

Full list: `luebeck/research/gastro_target_list.md`

**Priority Tier 1 (highest LTV + easiest close):**
- Boutique hotels (10–50 rooms): predictable pain, budget available
- Restaurants with >60 covers: reservation pain is real and felt daily
- Cafés with events/reservations: often no system at all

**Priority Tier 2:**
- Chain restaurants (lower urgency, longer sales cycle due to corporate approval)
- Very small cafés (<20 seats): may not justify cost — route to Option A pricing

---

## KPIs PER CLIENT

Track these in Google Sheets CRM for each Gastro client:

| Metric | Track how | Target |
|--------|-----------|--------|
| Time saved/week | Client self-report (monthly check-in) | 5–10 hrs |
| No-show rate | Reservation data before/after | < 5% |
| Google reviews/month | Track GMB before/after | +40–60% |
| Staff schedule time | Owner estimate | -2–3 hrs/week |
| NPS | Survey after 60 days | > 8 |
