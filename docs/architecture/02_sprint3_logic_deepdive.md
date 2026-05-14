# Architektur Deep-Dive: Sprint 3 (Smart-Grid & KI-Styling)
## Status: In Planung

### 1. KI-Styling Engine (Image-to-Image)
*   **Workflow:** User lädt Bilder hoch -> Storage -> `/api/style` -> Stable Diffusion API -> Transformiertes Bild -> Storage.
*   **Parameter:** Dynamische Anpassung basierend auf "Vibes" (Cinematic, Romantic, Pop-Art).

### 2. Smart-Grid-Algorithmus (OpenCV)
*   **Kern-Logik:** "Reverse-Puzzle".
*   **Schritte:**
    1.  Analyse des Hauptbildes (Strukturen, Kanten, Farbverteilung).
    2.  Analyse der 30 Kacheln.
    3.  Matching-Matrix: Jede Kachel wird gegen jedes Raster-Segment im Hauptbild geprüft.
    4.  Optimierung: Minimierung der Differenz an den Kanten zwischen benachbarten Kacheln.
*   **Output:** Ein Mapping-Objekt `{ gridPosition: tileId }`.

### 3. Cloud-Storage & Asynchronität
*   Einsatz von Vercel Blob für niedrige Latenz.
*   API-Routen fungieren als Orchestratoren zwischen Storage, KI-Diensten und der Grid-Engine.
