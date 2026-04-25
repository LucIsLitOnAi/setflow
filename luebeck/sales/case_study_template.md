# Case Study Template
## Structure for Lübeck AI Automation Case Studies

---

## FILL-IN VERSION (for Claude Code generation)

When generating a case study with Claude Code, fill in this structured input and use the prompt in `.cowork/tech/claude_code_templates.md` — Pattern 2.

```
client_code: [e.g., "GASTRO_001" — never use real name unless client approved]
client_type: [Restaurant / Hotel / Café / Elektriker / SHK / Maler / etc.]
location: [Lübeck — area if relevant, e.g., "Altstadt", "St.-Jürgen"]
team_size: [number of employees]
automation_built: [which Make.com workflow from the template library]
before_state: [describe their process before, specific and concrete]
after_state: [describe their process after]
metric_1: [e.g., "No-show rate: 18% → 4%"]
metric_2: [e.g., "Time on scheduling: 3 hrs/week → 20 min/week"]
metric_3: [e.g., "Invoice payment time: avg 32 days → avg 12 days"]
client_quote: [verbatim quote from owner if available, otherwise paraphrase]
time_to_roi: [e.g., "Within first month"]
setup_time: [days from contract to live]
```

---

## PUBLISHED FORMAT (German, ~350 words)

Use this structure for the WordPress case study page and PDF version:

---

# [HEADLINE — result-focused, max 10 words]
_Example: "Wie Restaurant X seine No-Show-Rate von 18% auf 4% senkte"_

**Branche:** {client_type} | **Standort:** Lübeck | **Mitarbeiter:** {team_size}

---

## Die Herausforderung

_{2–3 sentences describing the pain point BEFORE the automation. Be specific. Use numbers if possible.}_

Beispiel: "Das Café-Team verbrachte jeden Sonntag zwei Stunden damit, den Wochenplan für acht Mitarbeiter manuell zusammenzustellen. Schichten wurden per WhatsApp-Gruppe kommuniziert, was regelmäßig zu Missverständnissen und kurzfristigen Ausfällen führte."

---

## Unsere Lösung

_{3–4 sentences describing WHAT was built, without heavy tech jargon. Focus on what the business now experiences.}_

Beispiel: "Wir haben eine automatisierte Schicht-Planung eingerichtet, die jede Woche freitags selbstständig läuft. Mitarbeiter füllen einmal pro Woche ein einfaches Formular auf dem Handy aus. Das System erstellt den Plan und schickt jedem Mitarbeiter seinen persönlichen Wochenplan per WhatsApp."

---

## Die Ergebnisse

- **{metric_1}** _(e.g., Koordinationsaufwand: von 2 Stunden auf 15 Minuten pro Woche)_
- **{metric_2}** _(e.g., Schicht-Fehler durch Missverständnisse: -80%)_
- **{metric_3}** _(optional — e.g., Mitarbeiterzufriedenheit messbar gestiegen)_
- **Amortisation:** {time_to_roi}

---

## Das sagt der Inhaber

> "{client_quote}"
> 
> — Inhaber, {client_type}, Lübeck

---

## Ihre Situation ähnlich?

Wir helfen Lübecker {client_type_plural} dabei, {pain_area} zu automatisieren — in der Regel innerhalb von zwei Wochen, ohne IT-Abteilung.

→ [Kostenloses 20-Minuten-Gespräch buchen]

---

## LINKEDIN POST VERSION (short, for social)

```
Neue Fallstudie: Wie ein Lübecker {client_type} {key_metric} durch Automatisierung erreicht hat.

Vorher: {before_state_one_line}
Nachher: {after_state_one_line}

Das Besondere: Das System läuft seit {time_running} komplett selbstständig.

Fallstudie im Link 👇
[case_study_url]

#KIAutomatisierung #Lübeck #Handwerk #Gastronomie #MakeAutomation
```

---

## HWK VERSION (for HWK newsletter / partner materials)

```
Digitalisierung in der Praxis: {client_type} aus Lübeck spart {key_metric}

[Short 3-paragraph summary of case study]

Luc Cassegrain, Digitalisierungspartner der HWK Lübeck, hat diese Lösung 
gemeinsam mit dem Betrieb entwickelt. Als HWK-Mitglied erhalten Sie 20% 
Rabatt auf die Einrichtungsgebühr.

→ Kontakt: [luc's email/phone]
```

---

## ANONYMIZATION RULES

Unless the client has explicitly given permission to use their real name:
- Use: "Ein Lübecker Restaurant" / "Ein SHK-Betrieb aus Lübeck" / "Ein Café in der Altstadt"
- Assign client code in your CRM: GASTRO_001, HANDWERK_001, etc.
- Request named permission at 90-day check-in (when they're happy and it feels natural)
- Offer: logo on our website + backlink from case study in exchange for named reference
