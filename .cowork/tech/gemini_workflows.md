# Gemini Workflows
## Parallel LLM Integration for Lübeck Business

---

## PHILOSOPHY: CLAUDE + GEMINI = COMPLEMENTARY

| Task | Best Tool | Why |
|------|-----------|-----|
| Strategic decisions, nuanced writing, proposals | Claude | Better reasoning + German quality |
| High-volume content gen (10+ items at once) | Gemini | Speed + cost for bulk tasks |
| Market research compilation (many sources) | Gemini | Long context window advantage |
| Complex automation planning | Claude | Better instruction following |
| Image/screenshot analysis (e.g., client website review) | Gemini | Multimodal strength |
| Batch lead research (20+ businesses at once) | Gemini | Parallel processing |

**Rule:** Use Gemini when volume > 5 outputs of the same type. Use Claude for anything requiring judgment, nuance, or relationship sensitivity.

---

## INTEGRATION OPTIONS (pick one to start)

### Option A: Content Generation (START HERE — easiest)

**What:** Case study first drafts, LinkedIn posts, email variations  
**How:** Luc provides structured data → Gemini generates 3–5 variants → Luc picks best  
**Henri setup time:** 2 days  
**Complexity:** Low — API call with template prompt + structured input

**Workflow:**
```
Luc fills Google Form:
  → client_name, industry, problem, solution, result_metric_1, result_metric_2, client_quote

Make.com trigger (Google Forms watch):
  → POST to Gemini API: "Generate case study from this data: {json}"
  → Gemini returns draft text
  → Make.com saves to Google Docs (new doc in client folder)
  → Luc gets WhatsApp: "Case study draft ready: {doc_link}"

Luc edits in Google Docs → publishes to WordPress
```

**Prompt template:**
```
Generate a German case study for a B2B automation consultancy. Use this data:
Client industry: {industry}
Problem before: {problem}
Solution implemented: {solution}
Result 1: {result_1}
Result 2: {result_2}
Client quote: {quote}

Format:
- Headline (max 10 words, result-focused)
- Challenge (2–3 sentences)
- Solution (3–4 sentences, avoid technical jargon)
- Results (3 bullet points with numbers)
- Client quote (verbatim or paraphrased)
- CTA: "Ähnliche Ergebnisse für Ihr Unternehmen? → [contact link]"

Tone: Professional but warm, German, B2B SMB audience.
```

---

### Option B: Market Research (Month 3 target)

**What:** Weekly auto-generation of 10–20 new prospecting targets  
**How:** Gemini searches + compiles business data for Lübeck targets  
**Henri setup time:** 1 week  
**Complexity:** Medium — requires Google Search API integration or manual data input

**Workflow:**
```
Weekly trigger (every Monday 9am):
  → Input: {city = Lübeck}, {segment = Gastro OR Handwerk}, {gewerk = Elektriker}
  
  → Gemini prompt:
    "Research 10 {segment} businesses in {city} that:
    - Have fewer than 20 employees
    - Have a basic or no website
    - Show signs of manual processes (no online booking, no app mentions)
    
    For each, provide:
    - Business name
    - Estimated size (micro/small/medium)
    - Website quality score (1–5)
    - Primary digital weakness
    - Outreach priority (High/Medium/Low)
    
    Format as JSON array."
  
  → Make.com parses JSON → adds rows to Google Sheets prospect list
  → Luc gets WhatsApp: "10 neue Leads für diese Woche: {sheets_link}"
```

**Limitation:** Gemini can generate plausible business profiles but cannot reliably search live data. For verified contacts, Luc still needs to manually check websites + call. Use Gemini for the initial structure, not as a live search engine.

---

### Option C: Customer Communication AI (Month 4–5, if needed)

**What:** AI-powered WhatsApp auto-reply for client inquiries (outside business hours)  
**How:** Incoming message → Gemini classifies intent → generates response → sends via WhatsApp API  
**Henri setup time:** 2 weeks  
**Complexity:** High — requires careful prompt engineering to avoid wrong responses

**Only implement if:**
- A client specifically requests it
- Luc/Henri have bandwidth to QA the responses thoroughly
- The client's inquiry volume justifies it (> 30 messages/week outside hours)

**Use Claude for this, not Gemini** — accuracy matters more than speed for client communication.

---

### Option D: Workflow Suggestion Engine (Month 5+)

**What:** Analyze client's business description → Gemini suggests top 3 automation opportunities  
**How:** Discovery call notes → Gemini analysis → structured automation recommendations  
**Use case:** Henri enters notes from Luc's discovery calls → Gemini drafts the automation proposal  

**Prompt:**
```
I'm an automation consultant. A prospect described their business as follows:
{discovery_call_notes}

Based on their current processes, identify:
1. Top 3 automation opportunities (ranked by ROI + ease of implementation)
2. For each: what data they'd need to provide, which tools would work, estimated hours saved/week
3. One "quick win" they could see results from within 1 week

Output: JSON with structured recommendations.
```

---

## ASYNC HANDOFF: CLAUDE ↔ GEMINI ↔ MAKE.COM

```
[Luc's need] → [Claude for planning/strategy]
                     ↓
               [Claude outputs structured prompt/data]
                     ↓
               [Gemini for bulk generation]
                     ↓
               [Make.com routes output to right place]
                     ↓
               [Luc reviews + approves]
```

**Never:** Skip Luc's review on anything client-facing. AI output → human review → send.

---

## SETUP CHECKLIST (Henri)

- [ ] Get Google AI Studio API key (Gemini API)
- [ ] Store key in Make.com as environment variable (never hardcode)
- [ ] Build test scenario: Form input → Gemini API call → Sheets output
- [ ] Validate response quality on 5 test cases before using live
- [ ] Set token limits: max 1,000 tokens output per call to control cost
- [ ] Monitor API costs: stay under €20/month unless ROI is clear
