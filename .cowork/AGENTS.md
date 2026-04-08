SetFlow — Claude Code Agent Instructions
⚠️ CRITICAL: ALWAYS READ THIS FIRST
You are working on an EXISTING project.
DO NOT:
* Rebuild the app from scratch
* Create new HTML/JS/CSS files unless explicitly asked
* Assume the project doesn't exist because you don't see files listed
ALWAYS DO:
1. Read the existing file first: `/Users/fynndahouse/Documents/setflow/index.html`
2. Check this `.cowork/` directory for context and status
3. Make surgical edits to the existing code only
4. Confirm what you found before making changes
Project Location

```
/Users/fynndahouse/Documents/setflow/
├── index.html          ← SINGLE SOURCE OF TRUTH (all HTML, CSS, JS)
└── .cowork/
    ├── AGENTS.md       ← this file
    ├── STATUS.md       ← current build status
    └── ROADMAP.md      ← feature roadmap

```

Stack
* Frontend: Vanilla JS + HTML5 + CSS (no build system, single file)
* Persistence: localStorage (`setflow-data`)
* Export: Rekordbox XML, JSON backup
* Hosting: GitHub Pages → lucislitonai.github.io/setflow/
* Target domain: djstash.app
* Future: Node.js/Express/Socket.io backend on Railway.app (multi-DJ SaaS)
Current State (as of April 2026)
* ✅ Track library with metadata (BPM, Key, Energy, Genre, Role, Vibe tags)
* ✅ Artist management
* ✅ Set planner (duration-based, auto-build)
* ✅ Rekordbox XML export
* ✅ localStorage persistence (save/load with try/catch)
* ✅ JSON backup export/import
* ✅ Keyboard shortcuts (Space, arrows, Enter, Escape)
* ✅ Mobile layout (drawer sidebar, bottom nav)
* ✅ License management
How to Start Any Task

```
Step 1: Read /Users/fynndahouse/Documents/setflow/index.html
Step 2: Read /Users/fynndahouse/Documents/setflow/.cowork/STATUS.md
Step 3: Only then make changes

```

Never skip Step 1 and 2.


Coding Rules
* Keep everything in `index.html` until backend is introduced
* Always call `save()` after any state mutation
* Use `try/catch` around localStorage operations
* Mobile-first CSS (≤640px breakpoint)
* No external dependencies unless explicitly approved
