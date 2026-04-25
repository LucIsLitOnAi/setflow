# Weekly Standup — Google Sheets Template
## Setup Guide for `Weekly_Standups` Tab in Lübeck_Master_Tracker

---

## TAB STRUCTURE

This documents the exact layout for the `Weekly_Standups` tab. Each week = one row block.

---

## COLUMN SETUP

Row 1 (Header, frozen):

| Col | Header |
|-----|--------|
| A | Week Starting |
| B | Luc: Top 3 Priorities |
| C | Henri: Top 3 Priorities |
| D | Luc: Done Last Week |
| E | Henri: Done Last Week |
| F | Luc: Blockers |
| G | Henri: Blockers |
| H | New Clients This Week |
| I | MRR This Week (€) |
| J | Active Clients Total |
| K | Decisions Made |
| L | Next Milestone |
| M | Risk Flags |

---

## WEEKLY FILL-IN ROUTINE

**Luc fills columns A, B, D, F, H, I, J, L, M by Sunday 9pm**  
**Henri fills columns C, E, G by Monday 12pm**

---

## GOOGLE SHEETS VERSION — Row-by-Row Example

Row 2 (Week 1 — April 7):
```
A: 2026-04-07
B: "1. HWK email sent 2. Verify top 5 Gastro targets 3. Google Drive setup done"
C: "1. Review tech stack decisions 2. Start Job Dispatch Make.com template 3. GitHub setup"
D: "Reviewed full roadmap + templates. Assigned Henri tasks."
E: "Cloned Make.com account. Read all segment playbooks."
F: "Need HWK contact name before sending — researching"
G: "WhatsApp API decision needed — evaluating Twilio vs 360dialog"
H: 0
I: 0
J: 0
K: "Decided: Google Sheets as CRM for now"
L: "Week 2: HWK email sent, 5 Gastro outreach"
M: "None"
```

---

## ASYNC FORMAT (Markdown — for GitHub-based standup)

Use the template in `.cowork/async_collab/weekly_standup_template.md` for the full async format.

This Google Sheets version is the simplified tracking layer.

---

## FORMULA FOR WEEK-OVER-WEEK GROWTH

Add below the main table (around row 50+):

```
MRR Growth (Week-over-Week):
=I[this week] - I[last week]   e.g., =I10-I9

% Growth:
=(I[this week] - I[last week]) / I[last week]   format as %
```

---

## COLOR CODING GUIDE

Apply to Column H (New Clients This Week):
- 0 clients: White (no fill)
- 1–2 clients: Light green
- 3+ clients: Dark green

Apply to Column F + G (Blockers):
- Empty cell: White
- Any text (blocker exists): Light red background → prompts Sunday discussion

---

## END-OF-SPRINT SUMMARY ROW

At the end of each sprint (month), add a summary row:

| Col | Content |
|-----|---------|
| A | "APRIL 2026 SUMMARY" (bold, dark background) |
| H | Total new clients in April |
| I | End-of-month MRR |
| J | Total active clients |
| K | Key decisions this month |
| L | Next sprint focus |
| M | Biggest risk going into next month |
