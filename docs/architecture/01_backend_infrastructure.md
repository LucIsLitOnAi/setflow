# Backend-Infrastruktur: MosaicReveal
## Status: In Vorbereitung (Sprint 2 & 3)

### 1. API-Struktur
Die Backend-Routen sind innerhalb des Next.js App-Routers unter `src/app/api/` organisiert:
*   `/api/upload`: Endpunkt für das Hochladen von Hauptbildern und Kachel-Assets.
*   `/api/style`: Schnittstelle zur Anbindung von Image-to-Image APIs für das KI-Styling.

### 2. Core Engine (Smart-Grid)
Der zentrale Algorithmus zur Anordnung der Kacheln wird isoliert in `src/lib/grid-engine/` entwickelt.
*   **Technologie:** Node.js (Initial), mit geplanter Brücke zu Python/OpenCV oder spezialisierten WASM-Modulen für Kanten- und Objekt-Matching.
*   **Fokus:** Performantes Matching von ca. 30 Kacheln gegen das Hauptbild basierend auf strukturellen Merkmalen statt reiner Farbanalyse.

### 3. Logistik-Schnittstellen (Geplant)
In späteren Sprints werden hier Anbindungen an Druckdienstleister (Cloudprinter/Gelato) integriert.
