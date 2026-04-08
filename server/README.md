# SetFlow Server

Express + Socket.io backend for SetFlow — real-time set sync between DJ clients.

## Setup

```bash
cd server
npm install
cp .env.example .env   # then edit PORT if needed
npm run dev            # or: npm start
```

## Endpoints

| Method | Path         | Status        | Description            |
|--------|--------------|---------------|------------------------|
| GET    | /api/health  | ✅ live        | Health check           |
| GET    | /api/sets    | 🚧 stub        | List saved sets        |
| POST   | /api/sets    | 🚧 stub        | Persist a set          |

## Socket.io Events

| Event        | Direction          | Description                         |
|--------------|--------------------|-------------------------------------|
| `set:update` | client → broadcast | Sync set changes to other clients   |
| `set:lock`   | client → broadcast | Lock a track to prevent dual-edit   |

## Environment Variables

```
PORT=3001
```

## Stack

- **Express 4** — REST API
- **Socket.io 4** — real-time sync
- **cors** — cross-origin for localhost + GitHub Pages
- **dotenv** — environment config
