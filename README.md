# SetFlow — DJ Music Organizer

SetFlow ist ein minimalistischer DJ-Werkzeugkasten im Paper-Stil: Tracks importieren, Metadaten (BPM, Key, Genre, Vibe, Energie) verwalten, Lizenzen tracken und Sets planen — alles in einer einzigen HTML-Datei, die direkt im Browser läuft. Ein Node.js-Backend ermöglicht Account-Login und Real-time-Sync zwischen mehreren Geräten via Socket.io.

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Frontend | Vanilla JS, reines HTML/CSS — keine Build-Tools, keine Dependencies |
| Backend | Node.js + Express + Socket.io + PostgreSQL |
| Auth | JWT (7 Tage) + bcrypt |
| Hosting | GitHub Pages (client) + Railway (server) |

---

## Ordnerstruktur

```
setflow/
├── client/
│   └── index.html        ← Die komplette App (HTML + CSS + JS in einer Datei)
├── server/
│   ├── index.js          ← Express-Server, Auth-API, Socket.io
│   ├── package.json
│   ├── package-lock.json
│   ├── Procfile          ← Railway: web: node index.js
│   └── railway.toml      ← Railway-Konfiguration
├── .gitignore
└── README.md
```

---

## Setup lokal

**Client** — einfach im Browser öffnen:
```bash
open client/index.html
# oder: Datei per Drag & Drop in den Browser ziehen
```

**Server** — Terminal in `server/`:
```bash
cd server
npm install
cp .env.example .env   # DATABASE_URL + JWT_SECRET eintragen
node index.js
# Dev-Modus mit Auto-Reload:
npm run dev
```

Server läuft dann auf `http://localhost:3001`.  
Im Client die `SERVER_URL`-Variable oben in `index.html` auf `http://localhost:3001` setzen.

---

## Deploy

| Ziel | Dienst | Befehl / Trigger |
|---|---|---|
| Frontend | GitHub Pages | Push auf `main` → `client/index.html` wird direkt serviert |
| Backend | Railway | Push auf `main` → Auto-Deploy via `railway.toml` |

Produktions-Server: `https://setflow-production-6d3b.up.railway.app`

---

## Feature-Stand v0.4.0

- Track-Import per Drag & Drop oder File-Picker
- Metadaten: BPM, Key, Energie (1–5), Vibe-Tags, Genre/Subgenre, Cover Art
- License-Tracking: Own / Licensed / Promo / None / Unknown + Notizfeld
- License-Warning: Sidebar-Badge + Alert-Modal für unlizenzierte Tracks
- Filter-Bar: Genre, BPM-Range, Vibe, License, Key
- Artists-Ansicht (Grid) aus Track-Metadaten aggregiert
- Set Planner: Tracks zu Sets zusammenstellen, BPM-Kurve visualisiert
- Detail-Panel: Inline-Editing aller Felder, Cover-Upload
- Gig Planner: Datum + Venue pro Track speichern
- Own Productions: Upload-Flow mit `lic: 'own'` vorbelegt
- Account-System: Register / Login / Logout (JWT)
- Real-time-Sync via Socket.io (`set:update`, `set:lock`)
- Offline-fähig: alles läuft lokal per `localStorage`, Server optional
