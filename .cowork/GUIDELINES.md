# Collaboration Guidelines — Luc + Henri

---

## ASYNC-FIRST CULTURE

We do not have scheduled daily meetings. Everything runs async:

- **Primary channel:** Google Drive (documents + comments)
- **Quick pings:** WhatsApp (for urgent blockers only)
- **Weekly sync:** 30-min Zoom every Sunday (review KPIs + set next week priorities)
- **Bi-weekly client review:** Luc leads, Henri joins for technical questions

---

## ROLE BOUNDARIES

### LUC — Sales, Relationships, Client Success

| Responsibility | Details |
|----------------|---------|
| HWK partnership | Outreach, calls, relationship management |
| Gastro cold outreach | Cold email/calls, demo scheduling |
| Client onboarding | First contact, needs assessment, contract signing |
| Client success | Weekly check-ins, collecting case study data |
| Local networking | Lübeck events, referral cultivation |
| Strategy | Roadmap updates, pricing decisions |

**Time split:** 70% sales/client — 30% strategy/ops  
**Tools:** Google Sheets CRM, WhatsApp, email, phone

### HENRI — Tech, Automation, Content

| Responsibility | Details |
|----------------|---------|
| Make.com templates | Build, test, document all automation workflows |
| Client deployments | Customize templates per client, monitor post-launch |
| Gemini integration | Build parallel LLM workflows (Month 3+) |
| QA | Test all automations before client handover |
| Documentation | Keep tech docs in `.cowork/tech/` current |
| Marketing tech | WordPress case study site, SEO setup |

**Time split:** 80% technical — 20% strategy/docs  
**Tools:** Make.com, Claude Code, Google Gemini, GitHub, WordPress

---

## WEEKLY WORKFLOW

### Sunday (async, before 9pm)
1. Luc + Henri each fill in their section of the standup template
2. Review last week's KPIs (update `OVERVIEW.md` pipeline counts)
3. Set top 3 priorities for the coming week

### Monday (async)
1. Both read each other's standup section
2. Comment/react in Google Drive (no meeting required)
3. Adjust priorities if blockers found

### Friday (async)
1. Quick status update in decision_log.md for any new decisions made
2. Flag any blockers that need Sunday attention

---

## FILE NAMING CONVENTIONS

```
Docs:    UPPER_SNAKE_CASE.md          (e.g., HWK_PITCH_EMAIL.md)
Sprints: sprint_N_month.md            (e.g., sprint_1_april.md)
Client:  [ClientName]_[type].md       (e.g., Niederegger_brief.md)
Data:    target_list_[segment].csv    (CSV for easy Google Sheets import)
```

---

## DECISION-MAKING PROTOCOL

**Small decisions** (< €200 cost, reversible): Luc or Henri decides alone, logs in `decision_log.md`

**Medium decisions** (€200–1K, or affects the other person's work): WhatsApp ping + get ack before proceeding

**Large decisions** (>€1K, new tools, pricing changes, hiring): Sunday Zoom + both must agree

---

## TASK HANDOFF FORMAT

When handing a task from Luc → Henri or vice versa, include:

```
TASK: [what needs to be done]
CONTEXT: [why, what client, what they said]
DEADLINE: [date or sprint]
OUTPUT NEEDED: [what Luc/Henri needs back — file, email, deployed workflow, etc.]
BLOCKED BY: [anything Henri/Luc needs from you first]
```

Leave this as a Google Docs comment or WhatsApp message (no Slack needed yet).

---

## WHAT CLAUDE CODE HANDLES

Claude Code is used for:
- Generating sales templates + outreach scripts
- Researching targets + documenting findings
- Creating project briefs and deployment checklists from a template
- Drafting case studies from data Luc collects
- Generating Make.com workflow documentation
- Updating KPI dashboards with new formula suggestions

Claude Code is NOT used for:
- Sending emails (Luc does this)
- Making client calls
- Actually deploying Make.com workflows (Henri does this)
- Final approval of any client-facing content (Luc reviews all)

---

## QUALITY BAR

Before anything goes to a client or partner:

1. Luc reads it for tone + relationship fit (is this how we'd talk to them?)
2. Henri reads it for technical accuracy (does the automation actually work as described?)
3. No typos in German (use LanguageTool before sending)
4. No placeholder text left in templates (`{variable}` format is ok, `[INSERT HERE]` is not)
