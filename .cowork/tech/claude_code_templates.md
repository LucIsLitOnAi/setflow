# Claude Code — Usage Patterns & Templates
## For Lübeck Market Automation

---

## WHEN TO USE CLAUDE CODE

Claude Code is the execution engine for tasks that would otherwise take Luc 2–4 hours manually. Use it for:

| Task | When | Estimated time saved |
|------|------|---------------------|
| Research + compile target lists | Before outreach campaigns | 3–4 hrs |
| Personalize cold-outreach emails | Before each outreach batch | 1–2 hrs |
| Draft case studies from data | After collecting client metrics | 1–2 hrs |
| Generate meeting notes / action items | After discovery calls | 30 min |
| Create project briefs | When onboarding new client | 1 hr |
| Update sprints based on progress | End of each sprint | 30 min |
| Summarize decision context | Before logging in decision_log | 15 min |

---

## PROMPT PATTERNS

### Pattern 1: Personalized Cold Outreach

```
Context: I'm reaching out to Gastro businesses in Lübeck to sell AI automation services 
(Make.com workflows). Use the cold outreach template in luebeck/sales/gastro_cold_outreach_script.md.

Target business: [Business Name]
Type: [Restaurant/Hotel/Café]
Specific detail: [e.g., "they have 200+ Google reviews mentioning slow service during weekends", 
                   or "they don't have a reservations system — you can only walk in", 
                   or "their Instagram shows they're very active on events"]
Pain point to focus on: [no-shows / staff scheduling / reservation aggregation]

Generate: A personalized cold outreach email (under 150 words, German, professional but 
warm tone). Subject line + body. End with a clear CTA (discovery call booking).
```

---

### Pattern 2: Case Study Draft

```
I have data from a completed client project. Generate a case study following the template 
in luebeck/sales/case_study_template.md.

Client: [Business name + type] (anonymize if needed)
Before state: [describe their process before we worked with them]
What we built: [Make.com workflow + which template we used]
After state / results:
  - Time saved: [X hrs/week]
  - Metric improvement: [e.g., no-show rate dropped from Y% to Z%]
  - Client quote: [exact quote if available, or paraphrase]
  - Time to ROI: [when did it pay for itself]

Generate: A case study in German, structured as in the template, ready to publish on 
the WordPress site. 300–500 words.
```

---

### Pattern 3: Sprint Update

```
End of sprint. Update the current sprint file with actuals vs targets.

Sprint file: .cowork/sprints/sprint_X_month.md
KPI actuals:
  - Active clients: [N]
  - New contracts: [N]
  - MRR: [€]
  - Key wins: [bullet list]
  - Key blockers: [bullet list]

Generate: Updated sprint file with actuals filled in + a brief retrospective section 
(what to carry forward to next sprint).
```

---

### Pattern 4: Discovery Call Prep

```
I have a discovery call with [Business Name] tomorrow. They're a [Gastro/Handwerk] 
business, type [restaurant/hotel/elektriker/etc.].

What I know about them: [from research or website visit]
Primary pain I expect: [reservation chaos / invoicing delays / dispatch problems]

Generate:
1. 5 discovery call questions tailored to their business type
2. The key metrics I should try to quantify during the call (to use in proposal)
3. The 1–2 Make.com workflows I should lead with for this profile
4. A 30-second "why us" pitch in German, tailored to their pain
```

---

### Pattern 5: Research Compilation

```
Research Handwerk businesses in Lübeck for cold outreach. Focus on [Gewerk: Elektriker/
SHK/Maler/etc.].

For each business found, extract:
- Business name
- Address / area of Lübeck
- Estimated size (micro <3 employees, small 3–10, medium 10–20)
- Website: yes/no + quality score (1–5 based on modernity)
- Google review count + rating
- Any signals of low digitalization (e.g., no online booking, generic email)
- Outreach priority (High/Medium/Low based on signals)

Output: Markdown table, 15–20 businesses. Flag all contact info as ⚠️ VERIFY.
```

---

## FILE UPDATE WORKFLOW

When Claude Code generates new content, update these files:

1. New research → append to `luebeck/research/gastro_target_list.md` or `handwerk_target_list.md`
2. New template variant → add to `luebeck/sales/` as new section or new file
3. Sprint update → edit the relevant sprint file
4. New decision → log in `.cowork/async_collab/decision_log.md`
5. New case study → create `luebeck/sales/case_studies/[client_code]_case_study.md`

---

## QUALITY CHECK BEFORE USE

Before sending any Claude Code output to a real client or partner:

- [ ] Read it out loud — does it sound like a human Lübeck local?
- [ ] Check for filler phrases: "Ich hoffe, diese E-Mail findet Sie gut" — remove these
- [ ] Verify any statistics cited are real and sourced
- [ ] Confirm CTA is specific (time + method), not vague ("would love to connect")
- [ ] Run through LanguageTool for German grammar
