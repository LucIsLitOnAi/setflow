# Google Drive Setup Guide
## Lübeck_Market_2026 — Complete Setup Instructions

**Estimated time:** 20–30 minutes (one-time)  
**Who does this:** Luc (creates + shares with Henri)

---

## STEP 1: Create the Root Folder

1. Go to drive.google.com
2. Click **+ New → Folder**
3. Name it: `Lübeck_Market_2026`
4. Click **Create**

---

## STEP 2: Share with Henri

1. Right-click `Lübeck_Market_2026` → **Share**
2. Enter Henri's Google email
3. Set permission: **Editor**
4. Uncheck "Notify people" (unless you want to send him an email)
5. Click **Share**

---

## STEP 3: Create All Subfolders

Inside `Lübeck_Market_2026`, create these 6 folders (in order, with emojis):

```
📊 01_Dashboards_Tracking
📋 02_Roadmap_Strategy
💼 03_Sales_Partnerships
🛠️ 04_Technical
📁 05_Client_Projects
📅 06_Sprints
```

**How:** New → Folder → Name → Create, repeat for each.

Inside `03_Sales_Partnerships`, create 2 subfolders:
```
HWK_Partnership
Gastro_Outreach
```

Inside `05_Client_Projects`, create:
```
_Template_New_Client
```

---

## STEP 4: Create the Google Sheets Files

### 4a. Lübeck_Master_Tracker (main CRM + KPIs)

1. Open `📊 01_Dashboards_Tracking`
2. **+ New → Google Sheets**
3. Name: `Lübeck_Master_Tracker`
4. Create these tabs (bottom tab bar):
   - `Pipeline` (client CRM)
   - `KPI_Dashboard` (weekly metrics)
   - `Weekly_Standups` (async logs)
   - `Action_Items` (Luc vs Henri tasks)
   - `Risk_Register` (risk tracking)

**Tab: Pipeline** — Set up columns in Row 1:
```
A: ID | B: Business Name | C: Segment | D: Gewerk/Type | E: Contact Name | F: Phone | G: Email | H: Stage | I: Monthly Fee (€) | J: Setup Fee (€) | K: Contract Date | L: Go-Live Date | M: MRR Active | N: NPS Score | O: Notes
```

**Tab: KPI_Dashboard** — See `luebeck/templates/kpi_dashboard_template.md` for full setup

**Tab: Weekly_Standups** — See `luebeck/templates/weekly_standup_template.md` for full setup

**Tab: Action_Items** — Columns:
```
A: Date | B: Task | C: Owner (Luc/Henri) | D: Status | E: Due Date | F: Notes
```

**Tab: Risk_Register** — Columns:
```
A: Risk | B: Probability (H/M/L) | C: Impact (H/M/L) | D: Mitigation | E: Owner | F: Status
```

---

## STEP 5: Create the Google Docs Files

### In `📋 02_Roadmap_Strategy`:
1. **9_Month_Roadmap** — New Google Doc → paste content from `.cowork/ROADMAP.md`
2. **Segment_A_Gastro_Playbook** — paste from `.cowork/segments/segment_a_gastro.md`
3. **Segment_B_Handwerk_Playbook** — paste from `.cowork/segments/segment_b_handwerk.md`
4. **Tech_Stack_Decisions** — paste from `.cowork/async_collab/decision_log.md`

### In `💼 03_Sales_Partnerships/HWK_Partnership`:
1. **HWK_Pitch_Email_Variants** — paste from `luebeck/sales/hwk_partnership_pitch_email.md`
2. **Proposal_Template** — paste from `luebeck/sales/proposal_template.md`
3. **HWK_Contact_Research** — New Google Sheet with columns from `handwerk_target_list.md`

### In `💼 03_Sales_Partnerships/Gastro_Outreach`:
1. **Cold_Outreach_Script** — paste from `luebeck/sales/gastro_cold_outreach_script.md`
2. **Case_Study_Template** — paste from `luebeck/sales/case_study_template.md`
3. **Gastro_Target_List** — New Google Sheet with columns from `gastro_target_list.md`

### In `🛠️ 04_Technical`:
1. **Make_Automation_Templates** — paste from `.cowork/tech/make_automation_patterns.md`
2. **Gemini_Workflow_Integration** — paste from `.cowork/tech/gemini_workflows.md`
3. **Claude_Code_Patterns** — paste from `.cowork/tech/claude_code_templates.md`

### In `📁 05_Client_Projects/_Template_New_Client`:
1. **Project_Brief** — New blank Google Doc (template for each new client)
2. **Deployment_Checklist** — New Google Doc (copy deployment checklist from make_automation_patterns.md)
3. **Client_Communication** — New blank Google Doc

### In `📅 06_Sprints`:
1. Create a Google Doc for each sprint:
   - `Sprint_1_April` — paste from `.cowork/sprints/sprint_1_april.md`
   - `Sprint_2_May` — paste from `.cowork/sprints/sprint_2_may.md`
   - Continue for all 7 sprints

---

## STEP 6: Get the Shareable Link

1. Right-click `Lübeck_Market_2026` (root folder) → **Share**
2. Click **"Copy link"**
3. Paste the link here: `[PASTE DRIVE LINK HERE]`
4. Send link to Henri via WhatsApp/email

---

## STEP 7: Bookmark for Quick Access

1. In Google Drive, right-click `Lübeck_Market_2026` → **Add to My Drive** (or star it)
2. In Chrome: bookmark drive.google.com/drive/folders/[your-folder-id]
3. Rename bookmark: "🏗️ Lübeck Business"

---

## MAINTENANCE RULES

| Situation | What to do |
|-----------|-----------|
| New client signed | Create folder: `05_Client_Projects/[ClientCode]_[BusinessType]/` → copy files from `_Template_New_Client` |
| New decision made | Add to `Risk_Register` tab OR `decision_log.md` in GitHub |
| Sprint file updated in GitHub | Copy updated content to matching Sprint Doc in Drive |
| Case study written | Create new Google Doc in `03_Sales_Partnerships/Case_Studies/` (create this folder when first needed) |
| New outreach target | Add row to `Gastro_Target_List.gsheet` or `HWK_Contact_Research.gsheet` |

---

## WEEKLY SYNC ROUTINE (5 min)

Every Sunday before the standup:
1. Open `Lübeck_Master_Tracker` → `KPI_Dashboard` tab
2. Update: Active Clients, MRR, Pipeline counts
3. Open `Weekly_Standups` tab → copy last week's template row, fill in this week
4. Open GitHub (this repo) → check if any `.cowork/` files were updated → mirror to Drive if significant changes

---

## DRIVE LINK (fill in after setup)

```
ROOT FOLDER: 
Lübeck_Master_Tracker: 
HWK_Contact_Research: 
Gastro_Target_List: 
```
