# Ticket: Lesson 2 — `/lesson-2` Real Data

**Priority:** P1 — only after lessons 0-1 validated with real user
**Depends on:** lesson-2-add-indicators

## Problem

Everything so far is fake data. This lesson connects the app to real stock prices.
The wow moment: same chart, same indicators, but now showing REAL market data for a
ticker the student personally chose in lesson 0.

This is the most complex lesson — it introduces the backend data layer. But the boring
infrastructure (Docker, FastAPI skeleton, database config) is already pre-built. Students
build the interesting parts: provider pattern, data service, API endpoints.

## Requirements

### Skill file: `.claude/skills/lesson-2/SKILL.md`

1. **Start infrastructure** (~10 min)
   - Student runs `dc.sh up -d`, runs migration, hits health endpoint
   - Claude explains what's already there: "I pre-built the Docker setup and DB config.
     Your job is to build the data layer on top of it."

2. **Build data layer — Claude builds, explains** (~20 min)
   - StockPrice model + Alembic migration
   - Provider interface (`base.py`) + Yahoo Finance provider
   - DataService with cache-first strategy and market hours awareness
   - "This is the provider pattern. We code against an interface, not Yahoo directly."

3. **Build API endpoints** (~10 min)
   - `GET /api/v1/stocks/{symbol}/prices`
   - `GET /api/v1/stocks/{symbol}/indicators`
   - Student tests with curl

4. **The moment of truth** (~15 min)
   - Update frontend service: mock JSON → real API calls
   - Use student's ticker from lesson 0 (stored in `student.json`)
   - Refresh browser

   **WOW MOMENT:** Same chart, real data. The mock → real transition in a single refresh.

### KEY SKILL: Trusting Claude with infrastructure, then verifying

### Checkpoints
- [ ] Docker containers running (postgres + backend)
- [ ] Health endpoint responds
- [ ] Stock prices API returns data for student's chosen ticker
- [ ] Frontend chart shows real data (not mock)
- [ ] Student can explain: what's the provider pattern? what's cache-first?
- [ ] `progress.json` updated: lesson 2 complete

## Acceptance Criteria

- [ ] `/lesson-2` triggers and stays on plan
- [ ] Pre-built infra starts without issues
- [ ] Data pipeline works: Yahoo → DB → API → Chart
- [ ] Student's chosen ticker (from lesson 0) is used
- [ ] Mock → real transition is a single dramatic refresh
- [ ] Dashboard updates after completion
- [ ] ~60 min duration

## Out of Scope

- Multiple data providers (just Yahoo)
- Stock search/switching UI
- Stock lists management
- Advanced caching strategies
- Rate limiting or auth

## Reference

- Pre-built infra: Docker, FastAPI skeleton, DB config (from starter template)
- Provider reference: original `backend/app/providers/` in trading-analyst
- DataService reference: original `backend/app/services/data_service.py`
- Full lesson details: `docs/course-plan.md` → Lesson 2
