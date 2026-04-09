# SetFlow — Agent Context

Dieses Dokument beschreibt das Projekt für KI-Assistenten. Lies es vollständig bevor du Änderungen vorschlägst.

---

## Projektbeschreibung

SetFlow ist ein DJ Music Organizer — eine minimalistische Web-App im Paper/Ink-Design.  
DJs importieren Tracks, verwalten Metadaten (BPM, Key, Genre, Vibe, Energie, License) und planen Sets.  
Das Frontend ist eine **einzige HTML-Datei** ohne Build-Tools oder externe Abhängigkeiten.  
Der Server ist optional — die App läuft vollständig offline per `localStorage`.

- **GitHub:** https://github.com/LucIsLitOnAi/setflow
- **Live-Server:** https://setflow-production-6d3b.up.railway.app
- **Frontend (GitHub Pages):** https://lucislitonai.github.io/setflow/client/

---

## Dateistruktur & Verantwortlichkeiten

```
setflow/
├── client/
│   └── index.html        ← ALLES Frontend: HTML-Struktur, CSS (inline <style>),
│                            JavaScript (inline <script>), alle Views, alle Modals
├── server/
│   ├── index.js          ← Express-Server: Auth-REST-API, Socket.io, PostgreSQL
│   ├── package.json      ← Node-Abhängigkeiten (express, socket.io, pg, bcrypt, jwt)
│   ├── Procfile          ← Railway-Startbefehl
│   └── railway.toml      ← Railway-Deploy-Konfiguration
├── .gitignore
├── README.md
└── AGENTS.md             ← diese Datei
```

### `client/index.html` — interne Struktur

Die Datei ist in klar getrennte Blöcke gegliedert (Kommentare mit `═══`):

| Block | Inhalt |
|---|---|
| `<style>` | CSS-Variablen, alle Komponenten-Styles |
| HTML-Body | `.shell` > `.sb` (Sidebar) + `.main` (Content-Area) + `.pnl` (Detail-Panel) |
| Modals | Auth-Overlay, License-Modal, Gig-Planner-Modal |
| `<script>` Daten | `tracks[]` Array, `sets[]` Array, `SERVER_URL` Konstante |
| `<script>` State | `sel`, `filter`, `authToken`, `authUser`, `socket` |
| `<script>` Funktionen | `save()`, `load()`, `ren()`, `sts()`, `toast()`, View-Renderer, Event-Handler |

### `server/index.js` — Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| POST | `/api/auth/register` | Neuen Account erstellen |
| POST | `/api/auth/login` | Login, gibt JWT zurück |
| GET | `/api/auth/me` | Aktuellen User abrufen (auth required) |
| GET | `/api/health` | Health-Check (DB-Status, Version) |
| GET | `/api/sets` | Sets laden — TODO: noch nicht implementiert |
| POST | `/api/sets` | Set speichern — TODO: noch nicht implementiert |

Socket.io Events: `set:update`, `set:lock` (broadcast an alle anderen Clients)

---

## Regeln für Änderungen

### Allgemein
- **Surgical edits only** — ändere nur was gefragt wird, nie umliegenden Code
- **Never rebuild from scratch** — die App hat gewachsene Logik, kein Rewrite
- Lies **beide Dateien** (`client/index.html` und `server/index.js`) vollständig bevor du Änderungen machst
- Keine neuen Abhängigkeiten im Frontend — kein npm, kein Build-Tool, kein Framework

### Frontend-Spezifisch
- Nach jeder State-Mutation **immer `save()` aufrufen** — sonst gehen Daten beim Reload verloren
- Nach Änderungen am `tracks[]`-Array: `ren()` + `sts()` aufrufen
- CSS-Variablen aus `:root` verwenden — keine Hardcoded-Farben
- Design-Sprache: Paper/Ink, IBM Plex Mono/Sans, keine Emojis in der UI (außer explizit gewünscht)

### Server-Spezifisch
- `DATABASE_URL` und `JWT_SECRET` kommen aus `.env` — nie hardcoden
- Alle geschützten Routen brauchen `authRequired` Middleware
- Socket.io-Events müssen JWT-authentifiziert sein (Middleware ist bereits gesetzt)

---

## Feature-Stand

### Done (v0.4.0)
- Track-Import (Drag & Drop + File-Picker)
- Metadaten: BPM, Key, Energie, Vibe-Tags, Genre/Subgenre, Cover Art
- License-Tracking (Own / Licensed / Promo / None / Unknown) + Warning-System
- Filter-Bar (Genre, BPM, Vibe, License, Key)
- Artists-Ansicht (Grid, aggregiert aus Track-Metadaten)
- Set Planner (BPM-Kurve-Visualisierung)
- Detail-Panel (Inline-Editing, Cover-Upload)
- Gig Planner (Datum + Venue pro Track)
- Own Productions Upload-Flow
- Account-System (Register / Login / Logout, JWT)
- Real-time-Sync via Socket.io
- Offline-Modus (localStorage-First)

### Nächste Schritte (geplant)
- `/api/sets` GET/POST implementieren — Sets in PostgreSQL persistieren
- Cloud-Sync: `tracks[]` serverseitig speichern (aktuell nur localStorage)
- Export-Funktion (CSV / Setlist PDF)
- Rekordbox / Serato XML-Import
