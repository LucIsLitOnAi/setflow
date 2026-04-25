# .cowork — Agent Context

This repository serves two parallel purposes:

1. **SetFlow** — DJ Music Organizer (Vanilla JS + Node.js app)
2. **Lübeck Market Automation** — B2B AI automation consultancy (business docs)

---

## REPO MAP

```
setflow/
├── client/index.html         ← SetFlow frontend (all HTML/CSS/JS, no build tools)
├── server/index.js           ← SetFlow backend (Express + Socket.io + PostgreSQL)
├── AGENTS.md                 ← SetFlow agent context (read this for app work)
├── README.md                 ← SetFlow project docs
├── .cowork/                  ← YOU ARE HERE — dual-purpose project context
│   ├── AGENTS.md             ← this file
│   ├── ROADMAP.md            ← 9-month Lübeck business roadmap
│   ├── OVERVIEW.md           ← current state snapshot
│   ├── GUIDELINES.md         ← async collaboration rules (Luc + Henri)
│   ├── SYNC_INSTRUCTIONS.md  ← Google Drive sync guide
│   ├── sprints/              ← month-by-month sprint plans
│   ├── segments/             ← Gastro + Handwerk playbooks
│   ├── tech/                 ← automation tech docs
│   └── async_collab/         ← standup templates + decision log
└── luebeck/                  ← all Lübeck business artifacts
    ├── LUEBECK_ROADMAP_MEMORY.md  ← Knowledge Memory export
    ├── google_drive_setup.md
    ├── sales/                ← email templates, outreach scripts, proposals
    ├── research/             ← Gastro + Handwerk target lists
    └── templates/            ← KPI dashboard, standup, Make.com docs
```

---

## WORKING ON SETFLOW (DJ APP)?

→ Read `/home/user/setflow/AGENTS.md` first — it has the full app context, coding rules, and feature status.

Key rules:
- Single-file frontend: `client/index.html` (all CSS + JS inline)
- Always call `save()` after any state mutation
- No new external dependencies in the frontend
- Use CSS variables from `:root` — no hardcoded colors

---

## WORKING ON LÜBECK BUSINESS?

→ Start with `.cowork/ROADMAP.md` for strategic context, then the relevant sprint file or segment playbook.

Key files by task:
- **Sales call prep** → `luebeck/segments/` playbooks + `luebeck/sales/`
- **This week's priorities** → `.cowork/sprints/sprint_X_month.md`
- **KPI update** → `luebeck/templates/kpi_dashboard_template.md`
- **New business meeting** → `luebeck/sales/proposal_template.md`
- **Partner outreach (HWK)** → `luebeck/sales/hwk_partnership_pitch_email.md`

---

## TEAM

- **Luc Cassegrain** — Sales, partnerships, client success, local presence in Lübeck
- **Henri** — Technical architecture, Make.com automation, Gemini workflows

Both work async via Google Drive + GitHub. See `.cowork/GUIDELINES.md` for collaboration rules.
