# MASTER-DOKUMENT: KI-Kachel-Mosaik-App (Codename: MosaicReveal)
## Status: Infrastruktur bereit für Finale (Sprints 4 & 5) | Version: 1.3.0
## Letztes Update: 2026-05-14

### 0. Infrastruktur-Status (Backend-Skelett)
*   **Sprint 4 (Export):** Verzeichnis `src/lib/export-engine` und API-Slots für Gelato/Cloudprinter vorbereitet.
*   **Sprint 5 (Payment):** Stripe-Checkout und Webhook-Routen in `src/app/api/` angelegt.
*   **Umgebung:** `.env.example` um Stripe-Credentials erweitert.
*   **Doku:** Strategische Planung für Export und Payment unter `docs/architecture/03_sprint4_and_5_export_payment.md` finalisiert.

### 1. Produkt-Vision
Ein KI-gesteuertes Kachel-Mosaik mit einem Unboxing- und Rätsel-Erlebnis (Gamification). Der Nutzer lädt ein Hauptbild und ca. 30 Kachel-Bilder hoch. Die KI wendet Styles an und ordnet die Kacheln so an, dass sie durch Kanten- und Objekt-Matching das Hauptbild ergeben. Der Beschenkte setzt die gedruckten Einzelbilder (z.B. via Instant-Druck bei dm oder Online-Schnittstelle) anhand eines Lösungsblatts physisch zusammen.

### 2. Kern-Features (MVP-Scope)
* **KI-Styling:** Filter-Anwendung auf Einzelkacheln und/oder Gesamtbild via Image-to-Image APIs.
* **Smart-Grid-Algorithmus:** Kanten- und Objekt-Matching (z.B. OpenCV / Segment Anything) statt stumpfer Farbsortierung.
* **Gamification:** Generierung eines nummerierten "Schnittmusters" (Bild Nr. 31) als physische/digitale Vorlage für den Beschenkten.
* **Logistik-Infrastruktur:** CLI-/API-Anbindung an On-Demand-Druckdienstleister (z.B. Cloudprinter/Gelato) + Last-Minute-Fallback (Lokaler Express-Druck via formatiertem PDF/ZIP-Export).

### 3. Agenten-Protokoll & Sicherheits-Leitplanken
* **NotebookLM** fungiert als das strategische "Brain". Keine strukturelle Änderung am Konzept ohne Validierung durch das Brain.
* **Anti-Gravity** verwaltet die Datei-Infrastruktur, Automationen und System-Verzeichnisse innerhalb von `docs/` und steuert die operativen Workflows.
* **Jules** übernimmt die Code-Generierung und technische Umsetzung basierend auf den von Anti-Gravity bereitgestellten Strukturen.

### 4. Validierungs- und Wachstumsstrategie (Lean-Framework)
* **Entwicklungs-Leitlinie:** Radikale Fokussierung auf den Core-Nutzen. Keine komplexen Account- oder Einstellungsseiten im MVP. Ziel ist ein funktionierender Prototyp innerhalb von 2 Wochen.
* **Tech-Stack Orientierung:** Next.js / React, Node.js, Stripe (Payment) und Vercel (Deployment) unter maximalem Einsatz von AI-Coding-Infrastrukturen (Jules / Anti-Gravity).
* **Launch-Phasen:**
  1. *Phase 1 (Tag 14):* Fertiges MVP + sofortiger Start von Meta- & Google-Ads zur direkten Nachfrage-Validierung.
  2. *Phase 2 (Viraler Loop):* Fokus auf Short-Form-Video-Marketing (TikTok/Reels). Das physische "Rätsel-Zusammenlegen" wird als emotionaler Hook für organischen Traffic genutzt.
  3. *Phase 3 (Skalierung):* Implementierung eines Affiliate-Programms für Geschenke- und Lifestyle-Creator.
