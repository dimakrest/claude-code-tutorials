# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Educational monorepo of interactive tutorials that run inside Claude Code. Each tutorial is a self-contained project with its own CLAUDE.md. Currently contains one tutorial:

- **trading-dashboard/** — 6-lesson course building a stock analysis app (React + FastAPI + PostgreSQL)

## Repository Layout

- `trading-dashboard/` — Main tutorial project (has its own CLAUDE.md with project-specific rules)
- `README.md` — Prerequisites (Docker Desktop, Claude Code subscription) and getting started

## Working in a Tutorial

Always `cd` into the tutorial directory first. Each tutorial has its own CLAUDE.md, commands, and Claude Code skills. The root of this repo is just the container.

### Trading Dashboard Quick Reference

```bash
cd trading-dashboard

# Backend (Docker): start services, run tests
./scripts/dc.sh up -d
./scripts/dc.sh exec backend-dev pytest

# Frontend: dev server, tests
cd frontend && npm install && npm run dev
npm run test:unit          # Vitest
npm run test:ui            # Playwright component tests
npm run test:e2e           # Playwright end-to-end
npm run test:all           # All frontend tests
npm run lint               # ESLint

# Tutorial flow
claude
/introduce                 # Start here — onboarding + dashboard setup
/lesson-1                  # First lesson
```

**Key rule:** Never use `docker compose` directly — always use `./scripts/dc.sh` which auto-generates `.env.dev` with deterministic ports (hash-based, so multiple clones avoid conflicts).

## Architecture (Trading Dashboard)

- **Backend:** FastAPI, Python 3.11, PostgreSQL 15 (async via SQLAlchemy 2.0 + asyncpg), Alembic migrations
- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, ShadCN UI (Radix), TradingView Lightweight Charts
- **Infrastructure:** Docker Compose for backend + DB; frontend runs locally via `npm run dev`
- **Lessons:** Implemented as Claude Code skills (`.claude/skills/`), with agent definitions in `.claude/agents/`
- **State:** `progress.json` (lesson completion), `student.json` (student preferences)
