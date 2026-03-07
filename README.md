# MeiLearning System

Monorepo for the MeiLearning platform.

## Repository Layout

```text
MeiLearning System/
|-- frontend/            # React + Vite application
|-- backend/             # Backend service (scaffold / in progress)
|-- .editorconfig        # Shared editor rules
|-- .gitattributes       # Shared Git text normalization rules
|-- .gitignore           # Shared ignore rules for the whole monorepo
`-- README.md            # This file
```

## Working Model

- One Git repository for both frontend and backend.
- Shared repository conventions are managed at root.
- Each module keeps its own runtime dependencies and module-specific docs.

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

### Backend

Backend is currently scaffold-only. Start by defining stack and bootstrapping inside `backend/`.

## Team Conventions

- Keep cross-project policies at root (`.gitignore`, `.editorconfig`, CI configs).
- Keep module implementation docs close to code (`frontend/README.md`, `backend/README.md`).
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
