# Architektur: Sprint 4 (Export) & Sprint 5 (Payment)
## Fokus: Skalierung & Monetarisierung

### 1. Datenfluss: Grid-Engine zu Export
1.  **Python-Engine Output:** Jules' Engine liefert ein JSON-Mapping (Grid-Positionen zu Tile-IDs).
2.  **Export-Orchestrierung:** Die `src/lib/export-engine` (Node.js) liest dieses Mapping.
3.  **Asset-Aggregation:** Alle stilisierten Kachel-Bilder werden asynchron vom Cloud-Storage geladen.
4.  **PDF/ZIP-Generierung:** 
    *   Erstellung eines nummerierten "Schnittmusters" (Lösungsblatt Nr. 31).
    *   Verpacken der Einzelbilder und des Lösungsblatts in ein druckoptimiertes PDF oder ZIP-Archiv.

### 2. Monetarisierung & Payment-Gate
*   **Checkout:** Der Nutzer startet den Kaufprozess via `/api/checkout`. Stripe generiert eine Session.
*   **Webhook-Sicherheit:** Nach erfolgreicher Zahlung sendet Stripe einen Webhook an `/api/webhooks/stripe`.
*   **Berechtigung:** Erst nach Validierung des Webhooks wird in der Datenbank (oder Session) der Status auf `paid` gesetzt.
*   **Download-Freigabe:** Die Export-Engine generiert den Download-Link erst, wenn die Zahlung bestätigt ist.

### 3. Logistik-Anbindung (Sprint 4)
*   Platzhalter für Gelato und Cloudprinter ermöglichen die spätere direkte Übermittlung des Export-PDFs an physische Druckdienstleister.
