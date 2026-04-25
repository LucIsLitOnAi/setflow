# Google Drive Sync Instructions

This file explains how to mirror the `.cowork/` + `luebeck/` directory structure in Google Drive for Luc + Henri async collaboration.

---

## GOOGLE DRIVE FOLDER STRUCTURE TO CREATE

Create the following manually in Google Drive under a shared folder `Lübeck_Market_2026`:

```
Lübeck_Market_2026/  (shared with Henri — Editor access)
├── 📊 01_Dashboards_Tracking/
│   ├── Lübeck_Master_Tracker.gsheet     (from kpi_dashboard_template.md)
│   ├── Client_Pipeline.gsheet           (from kpi_dashboard_template.md)
│   └── Weekly_Standups.gsheet           (from weekly_standup_template.md)
├── 📋 02_Roadmap_Strategy/
│   ├── 9_Month_Roadmap.gdoc             (paste ROADMAP.md content)
│   ├── Segment_A_Gastro_Playbook.gdoc   (paste segment_a_gastro.md)
│   ├── Segment_B_Handwerk_Playbook.gdoc (paste segment_b_handwerk.md)
│   └── Tech_Stack_Decisions.gdoc        (paste tech_stack_decisions from .cowork/tech/)
├── 💼 03_Sales_Partnerships/
│   ├── HWK_Partnership/
│   │   ├── HWK_Pitch_Email_Variants.gdoc   (paste hwk_partnership_pitch_email.md)
│   │   ├── HWK_Contact_Research.gsheet     (from handwerk_target_list.md)
│   │   └── Proposal_Template.gdoc          (paste proposal_template.md)
│   └── Gastro_Outreach/
│       ├── Gastro_Target_List.gsheet       (from gastro_target_list.md)
│       ├── Cold_Outreach_Script.gdoc       (paste gastro_cold_outreach_script.md)
│       └── Case_Study_Template.gdoc        (paste case_study_template.md)
├── 🛠️ 04_Technical/
│   ├── Make_Automation_Templates.gdoc   (paste make_automation_templates.md)
│   ├── Gemini_Workflow_Integration.gdoc (paste gemini_workflows.md)
│   └── Claude_Code_Patterns.gdoc        (paste claude_code_templates.md)
├── 📁 05_Client_Projects/
│   └── _Template_New_Client/
│       ├── Project_Brief.gdoc
│       ├── Automation_Workflow.gdoc
│       └── Deployment_Checklist.gdoc
└── 📅 06_Sprints/
    ├── Sprint_1_April.gdoc
    ├── Sprint_2_May.gdoc
    └── ... (one per month)
```

---

## STEP-BY-STEP SETUP (one-time, ~20 minutes)

**Step 1: Create root folder**
1. Go to drive.google.com
2. New → Folder → Name: `Lübeck_Market_2026`
3. Right-click → Share → Add Henri's email → Editor

**Step 2: Create subfolders**
Create each of the 6 top-level folders above (copy names exactly, including emojis for visual scanning).

**Step 3: Import the Sheets templates**
For `Lübeck_Master_Tracker.gsheet`:
1. Create new Google Sheet
2. Add tabs: `Pipeline`, `KPI_Dashboard`, `Weekly_Standups`, `Action_Items`
3. Set up columns per `luebeck/templates/kpi_dashboard_template.md`

**Step 4: Import the Docs**
For each `.gdoc` file, create a new Google Doc and paste the contents of the corresponding `.md` file.
(The markdown formatting mostly survives paste — fix headers manually if needed.)

**Step 5: Copy shareable link**
Right-click `Lübeck_Market_2026` → Share → Copy link → Paste here:

```
DRIVE LINK: [paste here after setup]
```

---

## KEEPING GITHUB + DRIVE IN SYNC

**Rule:** GitHub (this repo) is the **source of truth**. Drive is the **working copy**.

| Direction | When | How |
|-----------|------|-----|
| GitHub → Drive | After major template updates | Copy-paste updated `.md` content into corresponding Google Doc |
| Drive → GitHub | After adding new decisions or contacts | Paste new content into the relevant `.md` file, commit |
| Auto-sync | Not set up (optional via Zapier) | If needed, Zapier: Google Drive file change → GitHub file update (Luc to set up) |

**Weekly routine:** Sunday standup → if any `.md` files were updated in GitHub this week → Henri or Luc copy changes to Drive.

---

## OPTIONAL: ZAPIER AUTO-SYNC

To automatically push weekly standup updates from Google Sheets → a GitHub commit:

1. Zapier trigger: "Google Sheets → New/Updated Row in Weekly_Standups tab"
2. Action: "GitHub → Create/Update File" targeting `.cowork/async_collab/weekly_standup_template.md`
3. Map: Zapier date field → commit message

This is optional and can wait until Month 2 once the manual process is established.
