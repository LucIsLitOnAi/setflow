# Segment B — Handwerk Playbook
## Lübeck Handwerksbetriebe (via HWK Partnership)

---

## SEGMENT OVERVIEW

| Property | Detail |
|----------|--------|
| Market size | 700+ businesses in HWK Lübeck network |
| Target profile | Small-medium trades with 3–20 employees |
| Decision maker | Inhaber (almost always sole decision-maker in small Betrieb) |
| Avg deal size | €400–1,000/month retainer + €500 setup fee |
| Sales cycle | 3–6 weeks (slower than Gastro — trades are skeptical of tech) |
| Primary channel | HWK referral (warm) >> cold outreach (harder) |

---

## PAIN POINTS (by priority)

1. **Paper-based job dispatch** — Jobs written in a notebook. Technicians call in for their next job. Boss spends 2+ hours/day on the phone coordinating.
2. **Delayed invoicing** — Invoice sent days or weeks after job completion. Customer has moved on mentally. Payment takes 45–90 days.
3. **No customer follow-up** — No feedback collected. No repeat business nurturing. One-off jobs that could become recurring relationships.
4. **Idle technician time** — Technicians waiting for next job, driving back to base unnecessarily. No geo-routing.
5. **Quote follow-up** — Quotes sent, never chased. 30–40% of potential revenue lost to poor follow-up.

---

## GATEWAY STRATEGY: HWK LÜBECK

**Why HWK first:**
- 700+ pre-qualified businesses in one network
- HWK relationship gives instant credibility ("HWK-empfohlener Dienstleister")
- One event can generate 10–20 warm leads in an afternoon
- HWK Innovation/Digitalisierung team is actively looking to support members

**HWK Contact:**
- Website: hwk-luebeck.de
- Address: Breite Str. 10/12, 23552 Lübeck ⚠️ VERIFY
- Relevant department: Technologie & Innovationsberatung (TIB)
- Email format: likely vorname.nachname@hwk-luebeck.de or info@hwk-luebeck.de ⚠️ VERIFY

**Partnership value prop (for HWK):**
- "Wir digitalisieren Ihre Mitglieder. Sie erhalten mehr Wert vom HWK-Membership."
- "HWK-Mitglieder bekommen 20% Rabatt auf Setup-Fee — HWK als Partner genannt."
- "Optional: HWK erhält eine Empfehlungsprovision (5–10% des ersten Jahres) für Referrals."
- "Case studies erscheinen als HWK Success Stories in Ihrem Mitglieder-Newsletter."

**Full pitch email variants:** `luebeck/sales/hwk_partnership_pitch_email.md`

---

## USE CASES (sorted by impact)

### 1. Job-Dispatch-Automation (Deployment: 3–5 days)
**What it does:** New job comes in (phone, form, or WhatsApp) → owner fills Google Form → Make.com routes to right technician based on geo + specialty → technician gets WhatsApp with job details + Google Maps link → job added to Google Calendar.

**Value pitch:** "Your boss stops being a human phone exchange. Technicians know their jobs without a 10-minute phone call each time."

**Tech:** Make.com + Google Forms + Google Sheets + WhatsApp API + Google Calendar  
**Complexity:** Medium — rules setup (geo logic, specialty routing) takes 1 extra day  
**Template:** `.cowork/tech/make_automation_patterns.md` — Workflow #3

**Pricing:** Standard retainer (€600–1,000/month)

---

### 2. Invoice-Real-Time (Deployment: 2–3 days)
**What it does:** Job completion → technician taps "done" in WhatsApp bot → Make.com pulls job data from Sheets → generates PDF invoice → sends to client email + WhatsApp → payment link included.

**Value pitch:** "Invoice goes out the same day the job is done. Our clients see payment come in 60–70% faster."

**Tech:** Make.com + Google Sheets + PDF generation (or Lexware/Billomat API) + email + Twilio  
**Complexity:** Medium — PDF generation setup + invoice template  
**Template:** `.cowork/tech/make_automation_patterns.md` — Workflow #4

**Pricing:** Standard retainer (€600–800/month) — strong standalone ROI

---

### 3. Customer Feedback + Repeat Business (Deployment: 1–2 days)
**What it does:** 24h after job completion → SMS to customer: "How was our work? [1-click rating]" → if positive: "We'd love a Google review: [link]" → if negative: Inhaber gets alert immediately.

**Value pitch:** "You catch unhappy customers before they write bad reviews. Happy customers leave good ones. Your GMB score improves, you get more inbound calls."

**Tech:** Make.com + Twilio SMS + Google Forms (simple rating) + Google Sheets  
**Complexity:** Low  
**Template:** `.cowork/tech/make_automation_patterns.md` — Workflow #5

**Pricing:** Add-on €200/month or bundled in standard retainer

---

### 4. Quote Follow-Up Automation (Deployment: 1 day)
**What it does:** Quote sent → Make.com logs it → 3 days later: auto-WhatsApp follow-up sent ("Hatten Sie Gelegenheit, unser Angebot zu prüfen?") → if no response after 7 days: second follow-up → if no response after 14 days: Inhaber gets notification to call.

**Value pitch:** "20–30% of quotes that would have been forgotten are now closed."

**Tech:** Make.com + Google Sheets (quote log) + WhatsApp API  
**Complexity:** Low  
**Pricing:** Included in growth retainer or add-on €150/month

---

## SALES PROCESS

**Step 1: Outreach**
- Via HWK (warm): HWK sends intro email → Luc follows up same day with call
- Direct cold: Use `luebeck/sales/handwerk_cold_outreach.md` — per-Gewerk variants
- Best approach: phone call first (not email), trades respond to direct conversation
- Best timing: 7:30–8:30am (before they head to job sites) or 5–6pm (back from site)

**Step 2: Discovery (30 min — can be on-site)**
Goals:
- Walk through their current job dispatch process ("Can you show me how a new job gets handled?")
- Count: How many WhatsApp groups for staff? (proxy for chaos)
- Ask: "How long after a job is done does the invoice go out?"
- Ask: "When did you last chase a quote that went quiet?"

**Step 3: Proposal**
- Lead with their biggest pain (ask them to rank: dispatch, invoicing, or follow-up?)
- Keep the proposal to 1 page — trades don't read long docs
- Use `luebeck/sales/proposal_template.md` (short version)
- Include concrete ROI number: "If you invoice same-day instead of 2 weeks later, and your avg job is €450, and you do 4 jobs/week — that's €7,200 that arrives 60% faster. That's cashflow."

**Step 4: Close**
- Common objection: "I need to think about it." → "Fair. What's your biggest concern — the tech side or the cost?"
- Use the HWK discount if they're hesitant: "Als HWK-Mitglied bekommen Sie €150 Rabatt auf die Einrichtungsgebühr."
- Contract: 3-month minimum, then monthly rolling
- Onboarding: 1-hr call with Inhaber + (if possible) head technician

---

## OBJECTION HANDLING

| Objection | Response |
|-----------|----------|
| "Meine Mitarbeiter sind nicht so technikaffin." | "Das Einzige, was Ihre Mitarbeiter machen müssen, ist eine WhatsApp lesen. Das können alle." |
| "Wir haben das immer gut ohne Digitalisierung gemacht." | "Das glaube ich. Die Frage ist nur: haben Sie Lust, noch 10 Jahre täglich Ihr eigener Disponent zu sein?" |
| "Was kostet mich das wirklich?" | "Einrichtung €500, dann €600/Monat. Wenn Sie durch schnelleres Invoicing nur 1 Zahlung früher bekommen — hat sich das im ersten Monat rentiert." |
| "Und wenn Make.com ausfällt?" | "Alle Daten liegen in Ihrer Google Sheets. Ihre Mitarbeiter können Sie immer noch normal anrufen. Es ist eine Ergänzung, kein Ersatz." |
| "Ich muss das erst mit meiner Frau besprechen." | "Natürlich! Darf ich Ihnen eine kurze Zusammenfassung schicken, die Sie ihr zeigen können?" |

---

## GEWERK-SPECIFIC TARGETING

| Gewerk | Primary Pain | Best Use Case | Outreach Script |
|--------|-------------|---------------|-----------------|
| Elektriker | Job dispatch, idle time | Job-Dispatch-Automation | `handwerk_cold_outreach.md` — Elektro variant |
| Sanitär/SHK | Invoicing delays, quote follow-up | Invoice-Real-Time | `handwerk_cold_outreach.md` — SHK variant |
| Maler | Scheduling seasonal peaks, customer comms | Schicht-Automation + Feedback | `handwerk_cold_outreach.md` — Maler variant |
| Dachdecker | Emergency dispatch, invoice | Job-Dispatch + Invoice | `handwerk_cold_outreach.md` — Allgemein variant |
| Tischler | Quote follow-up, customer feedback | Quote Follow-Up + Feedback | `handwerk_cold_outreach.md` — Allgemein variant |
| Kfz | Appointment scheduling, review gen | Reservierungs-Aggregation variant | `handwerk_cold_outreach.md` — Allgemein variant |

---

## SCALING PLAN (Month 2–9)

| Phase | Approach | Expected Conversions |
|-------|----------|---------------------|
| Month 2–3 | HWK intro + 3–5 direct pilots | 3–5 clients |
| Month 4–6 | HWK referral program active | 15–20 clients |
| Month 7–9 | HWK events + direct outreach + case studies | 50+ pipeline |

**Key leverage point:** Each deployed Handwerk client is a walking billboard in their Gewerk network. Elektriker talk to other Elektriker. Ask for a testimonial + referral at the 60-day mark.

---

## TARGET BUSINESSES (Lübeck)

Full list + contact research: `luebeck/research/handwerk_target_list.md`

**Priority for direct outreach (pre-HWK partnership):**
- SHK businesses (Sanitär/Heizung) — highest invoicing pain, most to gain from Invoice-Real-Time
- Elektriker — largest sub-segment, frequent small jobs, big dispatch pain
- Maler — seasonal peaks create scheduling chaos, easy Schicht use case
