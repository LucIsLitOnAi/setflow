# KPI Dashboard — Google Sheets Setup
## Lübeck Market Automation — Live Tracking

---

## SHEET STRUCTURE

This document specifies the exact setup for the `KPI_Dashboard` tab in `Lübeck_Master_Tracker.gsheet`.

---

## TAB LAYOUT

### Section 1: Monthly Targets vs Actuals (Rows 1–15)

**Row 1:** Header row (bold, dark background)

| Col A | Col B | Col C | Col D | Col E | Col F |
|-------|-------|-------|-------|-------|-------|
| Month | Clients (Target) | Clients (Actual) | MRR Target (€) | MRR Actual (€) | % of Target |

**Rows 2–10:** One row per month (April → December)

| Row | A | B | C | D | E | F (formula) |
|-----|---|---|---|---|---|-------------|
| 2 | April 2026 | 0 | [manual] | €0 | [manual] | `=E2/D2` |
| 3 | May 2026 | 2 | [manual] | €1,500 | [manual] | `=E3/D3` |
| 4 | June 2026 | 4 | [manual] | €2,500 | [manual] | `=E4/D4` |
| 5 | July 2026 | 9 | [manual] | €4,500 | [manual] | `=E5/D5` |
| 6 | August 2026 | 13 | [manual] | €7,000 | [manual] | `=E6/D6` |
| 7 | September 2026 | 19 | [manual] | €9,500 | [manual] | `=E7/D7` |
| 8 | October 2026 | 23 | [manual] | €11,000 | [manual] | `=E8/D8` |
| 9 | November 2026 | 29 | [manual] | €14,000 | [manual] | `=E9/D9` |
| 10 | December 2026 | 32 | [manual] | €15,000 | [manual] | `=E10/D10` |
| 12 | **TOTAL** | | `=SUM(C2:C10)` | | `=SUM(E2:E10)` | `=E12/D12` |

---

### Section 2: Pipeline Funnel (Rows 16–25)

**Real-time pipeline driven from `Pipeline` tab**

| Row | Col A | Col B | Col C |
|-----|-------|-------|-------|
| 16 | Stage | Count | Formula |
| 17 | Leads | | `=COUNTIF(Pipeline!H:H,"Lead")` |
| 18 | Discovery Call | | `=COUNTIF(Pipeline!H:H,"Call")` |
| 19 | Proposal Sent | | `=COUNTIF(Pipeline!H:H,"Proposal")` |
| 20 | Contract Signed | | `=COUNTIF(Pipeline!H:H,"Signed")` |
| 21 | In Deployment | | `=COUNTIF(Pipeline!H:H,"Deploying")` |
| 22 | Live | | `=COUNTIF(Pipeline!H:H,"Live")` |
| 23 | Lost | | `=COUNTIF(Pipeline!H:H,"Lost")` |
| 25 | **Conversion Rate** | | `=B22/(B17+B22+B23)` |

---

### Section 3: Current MRR Breakdown (Rows 27–38)

| Row | Col A | Col B | Col C |
|-----|-------|-------|-------|
| 27 | **MRR by Segment** | | |
| 28 | Gastro MRR | | `=SUMIF(Pipeline!C:C,"Gastro",Pipeline!I:I)` |
| 29 | Handwerk MRR | | `=SUMIF(Pipeline!C:C,"Handwerk",Pipeline!I:I)` |
| 30 | **Total Active MRR** | | `=SUMIF(Pipeline!H:H,"Live",Pipeline!I:I)` |
| 32 | **MRR by Tier** | | |
| 33 | Small (< €700/mo) | | `=COUNTIFS(Pipeline!H:H,"Live",Pipeline!I:I,"<700")` |
| 34 | Standard (€700–1,500) | | `=COUNTIFS(Pipeline!H:H,"Live",Pipeline!I:I,">699",Pipeline!I:I,"<1500")` |
| 35 | Growth (> €1,500) | | `=COUNTIFS(Pipeline!H:H,"Live",Pipeline!I:I,">=1500")` |
| 37 | **Avg MRR per Client** | | `=B30/COUNTIF(Pipeline!H:H,"Live")` |
| 38 | **Projected LTV (12 mo)** | | `=B37*12` |

---

### Section 4: Performance Metrics (Rows 40–55)

| Row | Col A | Col B | Notes |
|-----|-------|-------|-------|
| 40 | **Time-to-Deploy (avg days)** | `=AVERAGEIF(Pipeline!H:H,"Live",Pipeline!L:L-Pipeline!K:K)` | K=contract date, L=go-live date |
| 41 | **Churn Rate (MTD)** | [manual update monthly] | |
| 42 | **NPS Average** | `=AVERAGEIF(Pipeline!N:N,">0",Pipeline!N:N)` | N=NPS score column |
| 43 | **Referral % of new leads** | [manual] | Track in notes |
| 44 | **HWK Pipeline (leads from HWK)** | [manual] | |

---

## CONDITIONAL FORMATTING RULES

Apply to Column F (% of Target) in Section 1:

| Condition | Format |
|-----------|--------|
| Value < 0.5 (< 50% of target) | Red background, white text |
| Value >= 0.5 AND < 0.8 | Yellow/orange background |
| Value >= 0.8 (80%+ of target) | Green background, white text |

Apply to Pipeline count cells (Rows 17–22 Col B):

| Stage | Green trigger |
|-------|--------------|
| Leads | > 10 = green |
| Live | > target for month = green |
| Lost | > 20% of total = red |

---

## WEEKLY UPDATE ROUTINE

Every Sunday before the standup:

1. Open `Pipeline` tab → update Stage for any clients that progressed
2. Open `KPI_Dashboard` → check that formulas auto-updated
3. Manually update: Churn Rate (D41), NPS manually added from client calls, Referral %
4. Take a screenshot of Section 2 (Pipeline Funnel) → paste into Weekly_Standups tab

---

## CHART RECOMMENDATIONS (Optional, Month 2+)

Once you have 4+ months of data:

**Chart 1: MRR Growth Line**
- Type: Line chart
- Data: Month (x-axis) vs MRR Actual + MRR Target (2 lines)
- Shows: trajectory vs goal

**Chart 2: Pipeline Funnel**
- Type: Bar chart (horizontal)
- Data: Stages vs Count (from Section 2)
- Shows: where leads are dropping off

**Chart 3: Gastro vs Handwerk MRR**
- Type: Stacked bar
- Data: Monthly → Gastro MRR vs Handwerk MRR
- Shows: segment mix evolution

---

## IMPORTANT NOTES

- All formulas reference the `Pipeline` tab — keep that tab name unchanged
- `[manual]` fields must be updated by whoever is doing the Sunday standup
- If you add new columns to `Pipeline` tab, update formula column references here
- Use `Ctrl+Shift+;` (Windows) or `Cmd+Shift+;` (Mac) to insert current date quickly in log cells
