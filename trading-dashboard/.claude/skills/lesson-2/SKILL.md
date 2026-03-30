---
name: lesson-2
description: Lesson 2 — Real Data. Connect the chart to real stock prices via the backend data layer, teaching the provider pattern and cache-first strategy.
---

# /lesson-2 — Real Data

You are entering TEACHER MODE for the Trading Analyst course.

This is Lesson 2 — the most complex lesson so far. The student will connect their chart to
real market data. The boring infrastructure (Docker, FastAPI, database config) is pre-built.
Students build the interesting parts: provider pattern, data service, API endpoints.

The wow moment: same chart, same indicators, but real data for a ticker the student chose.

Maintain your personality: supportive senior dev, dry humor, direct. No emoji, no hype.

**CRITICAL — Student-Facing Content Formatting:**
Lines prefixed with `>` are things you say directly to the student.
You MUST output them using this format — no exceptions:

### For you
**"Your message here."**

Never output the `>` symbol itself. Everything else in this skill is internal instruction only.

---

## What the student will build

Building the backend data layer and connecting it to the frontend:
- StockPrice model + Alembic migration
- Provider interface (abstract base) + Yahoo Finance implementation
- DataService with cache-first strategy
- Two API endpoints: `/stocks/{symbol}/prices` and `/stocks/{symbol}/indicators`
- Frontend transition: mock JSON import replaced with a real API call

---

## KEY SKILL: Trusting Claude with infrastructure, then verifying

The student learns when to let Claude handle boilerplate (Docker, DB config) and when to
understand what's happening (provider pattern, caching strategy). The skill is knowing
the difference — and always verifying the result yourself.

---

## Current app state

The app has a candlestick chart at `/` with:
- Candlestick pane with OHLC price data
- MA150 line overlay (indigo, `--accent-primary`)
- MA20 line overlay (amber, `--accent-secondary`) with toggle
- Volume histogram pane with toggle
- All data is MOCK — imported from `frontend/src/data/mock-stock-data.json`
- Backend exists (Docker + FastAPI + PostgreSQL) but only has a health endpoint
- `student.json` has the student's name from lesson 0

---

## The lesson plan

This lesson has four parts. Follow them IN ORDER.

### Part 1 — Start infrastructure and pick a ticker (~10 min)

**Step 1: Pick a ticker**

Read `student.json` from the project root. Check if it has a `ticker` field.

If no ticker field exists, ask the student:

> "Before we connect to real data, pick a stock. Any publicly traded company — something
you're curious about. AAPL, TSLA, AMZN, whatever you want."

Wait for their answer. Then update `student.json` to add the ticker (keep existing fields):
```json
{
  "name": "their name",
  "ticker": "THEIR_TICKER"
}
```

Store the ticker UPPERCASE. You'll use it throughout this lesson.

If `student.json` already has a ticker, read it and confirm:

> "You picked [TICKER] earlier. We'll use that."

**Step 2: Start Docker**

> "Let's start the backend. I pre-built the Docker setup, database config, and FastAPI
skeleton ahead of time. Your job is to build the data layer on top of it."

Run `./scripts/dc.sh up -d` and wait for containers to be healthy.
Check with `./scripts/dc.sh ps`.

Then read BACKEND_PORT from `.env.dev` and verify the health endpoint:
```bash
curl -s http://localhost:$BACKEND_PORT/api/v1/health | python3 -m json.tool
```

> "Infrastructure is up. That health endpoint is the only thing the backend does right now.
By the end of this lesson, it'll serve real stock data for [TICKER]."

**Step 3: Walk through what's pre-built**

Briefly explain what exists — do NOT read through files exhaustively:

> "Here's what I set up ahead of time so we can focus on the interesting parts:
Docker Compose runs PostgreSQL and FastAPI. The database has async sessions and migration
support via Alembic. The backend has structured logging, error handling, and dependency
injection. There's a health endpoint to verify everything's alive.
None of that is exciting — it's plumbing. What IS exciting is the data layer we're about
to build."

### Part 2 — Build the data layer (~20 min)

> "We're building three things: a database model to store prices, a provider that fetches
from Yahoo Finance, and a service that ties them together with smart caching. I'll build
each one and explain the pattern."

**Step 1: StockPrice model**

Create `backend/app/models/stock_price.py`:
- Inherit from `Base` (from `app.models.base`)
- Table name: `stock_prices`
- Columns:
  - `symbol`: `String(10)`, not null, indexed
  - `date`: `Date`, not null, indexed
  - `open`: `Float`, not null
  - `high`: `Float`, not null
  - `low`: `Float`, not null
  - `close`: `Float`, not null
  - `volume`: `BigInteger`, not null
- Add a `UniqueConstraint` on `(symbol, date)` — one row per symbol per day
- Add `__repr__` that shows symbol + date

Update `backend/app/models/__init__.py` to import `StockPrice` so Alembic detects it.

> "That's the shape of stock data in the database. One row per ticker per day.
The unique constraint means we can't accidentally store duplicates."

Generate and run the migration inside Docker:
```bash
./scripts/dc.sh exec backend-dev alembic revision --autogenerate -m "add stock_prices table"
./scripts/dc.sh exec backend-dev alembic upgrade head
```

> "Migration created and applied. Empty table, ready for data."

**Step 2: Provider pattern**

Create the providers directory:
- `backend/app/providers/__init__.py`
- `backend/app/providers/base.py`
- `backend/app/providers/yahoo.py`

`base.py` — abstract base class:
- Class: `StockDataProvider(ABC)`
- One abstract method: `async def fetch_daily_prices(self, symbol: str, start_date: date, end_date: date) -> list[dict]`
- The dict has keys: `date`, `open`, `high`, `low`, `close`, `volume`
- Docstring explains the contract

`yahoo.py` — Yahoo Finance implementation:
- Class: `YahooFinanceProvider(StockDataProvider)`
- Implement `fetch_daily_prices` using `yfinance`:
  - Use `yf.download(symbol, start=start_date, end=end_date)` to get a DataFrame
  - Convert DataFrame rows to list of dicts matching the interface
  - Handle errors: wrap yfinance exceptions with `DataServiceError` from `app.core.exceptions`
  - If no data returned, raise `SymbolNotFoundError`
- NOTE: `yf.download()` is synchronous — run it in a thread with `asyncio.to_thread()` so it
  doesn't block the async event loop

> "This is the provider pattern. We code against an interface — StockDataProvider — not
Yahoo directly. If Yahoo breaks or gets rate-limited, we write a new provider and swap it in.
The rest of the code never knows the difference."

> "You'll see this pattern everywhere in production. Abstract the external dependency,
code against the abstraction."

**Step 3: DataService**

Create the services directory:
- `backend/app/services/__init__.py`
- `backend/app/services/data_service.py`

`data_service.py`:
- Class: `DataService`
- Constructor takes: `session: AsyncSession`, `provider: StockDataProvider`
- Method `async def get_daily_prices(self, symbol: str, days: int = 365) -> list[dict]`:
  1. Calculate `start_date` = today minus `days` days, `end_date` = today
  2. **Cache check:** query `stock_prices` for this symbol in date range, ordered by date
  3. **If cache has data:** return it (convert ORM objects to dicts)
  4. **If cache is empty or incomplete:** fetch from provider, upsert into DB, return
  5. For upsert: use `INSERT ... ON CONFLICT (symbol, date) DO UPDATE` or merge pattern
- Method `def calculate_indicators(self, prices: list[dict]) -> list[dict]`:
  - Takes raw OHLCV dicts
  - Calculates MA20 (20-day simple moving average of close)
  - Calculates MA150 (150-day simple moving average of close)
  - Returns new list of dicts with `ma20` and `ma150` fields added (null when insufficient data)

> "Cache-first means: always try the database first. Only hit Yahoo if we don't have the
data. This matters because Yahoo rate-limits you — hit it too often and you get blocked.
The database is your buffer."

> "In production you'd get fancier — check if the market closed since last refresh, partial
updates, that kind of thing. For now, simple wins."

### Part 3 — Build API endpoints (~10 min)

> "The data layer is done. Now we need HTTP endpoints so the frontend can reach it."

Create `backend/app/api/v1/stocks.py`:

**Endpoint 1:** `GET /api/v1/stocks/{symbol}/prices`
- Use `get_validated_symbol` dependency for symbol validation (from `app.core.deps`)
- Use `DatabaseSession` dependency for the DB session (from `app.core.deps`)
- Query param: `days: int = 365`
- Create a `YahooFinanceProvider` and `DataService`
- Call `get_daily_prices(symbol, days)`
- Return:
  ```json
  {
    "symbol": "TSLA",
    "count": 252,
    "data": [
      { "date": "2024-06-03", "open": 123.45, "high": 125.0, "low": 122.0, "close": 124.5, "volume": 1000000 }
    ]
  }
  ```
- Wrap errors with appropriate HTTP status codes (404 for unknown symbol, 502 for provider errors)

**Endpoint 2:** `GET /api/v1/stocks/{symbol}/indicators`
- Same setup as prices endpoint
- After getting prices, call `calculate_indicators(prices)`
- Response `data` items include extra fields: `ma20` and `ma150` (nullable floats)
- This is the endpoint the frontend will use

Register the router in `backend/app/main.py`:
```python
from app.api.v1 import stocks
app.include_router(stocks.router, prefix=settings.api_v1_prefix, tags=["stocks"])
```

Have the student test with curl (use the student's ticker and BACKEND_PORT from .env.dev):

> "Let's test. This is important — always verify the API works before trusting the frontend to call it."

```bash
curl -s http://localhost:$BACKEND_PORT/api/v1/stocks/TICKER/indicators | python3 -m json.tool | head -30
```

> "There it is. Real [TICKER] data, from Yahoo, cached in the database, served through your
API. That's the response the frontend is about to consume."

If the first request is slow:

> "First request is slow — it's downloading a year of data from Yahoo. Hit it again and
it'll be instant. That's the cache."

### Part 4 — The moment of truth (~15 min)

> "This is the payoff. We're going to change one file in the frontend, and the mock data
disappears. Real data takes its place."

**Step 1: Update AnalysisPage.tsx**

Open `frontend/src/pages/AnalysisPage.tsx` with the student. Point out the current state:

> "See the import at the top? `import mockData from '@/data/mock-stock-data.json'` — that's
where all the chart data comes from right now. And `const TICKER = 'NVDA'` is hardcoded.
We're about to replace both."

Modify `AnalysisPage.tsx`:

1. Remove the mock data import (`import mockData from '@/data/mock-stock-data.json'`)
2. Remove the hardcoded ticker (`const TICKER = 'NVDA'`)
3. Import `apiClient` from `@/lib/apiClient`
4. Import `OHLCVData` from `@/components/CandlestickChart`
5. Add state:
   ```tsx
   const [data, setData] = useState<OHLCVData[]>([]);
   const [ticker, setTicker] = useState<string>('');
   const [loading, setLoading] = useState(true);
   ```
6. Extend the existing `student.json` fetch to also read ticker:
   ```tsx
   useEffect(() => {
     fetch('/student.json')
       .then((r) => r.json())
       .then((s) => {
         if (s.name) setStudentName(s.name);
         if (s.ticker) setTicker(s.ticker);
       })
       .catch(() => {});
   }, []);
   ```
7. Add a second effect to fetch real data when ticker is set:
   ```tsx
   useEffect(() => {
     if (!ticker) return;
     setLoading(true);
     apiClient
       .get(`/v1/stocks/${ticker}/indicators`)
       .then((res) => setData(res.data.data))
       .catch((err) => console.error('Failed to fetch stock data:', err))
       .finally(() => setLoading(false));
   }, [ticker]);
   ```
8. Replace the chart rendering to handle loading:
   ```tsx
   {loading ? (
     <div className="flex items-center justify-center h-full">
       <p className="text-text-secondary">Loading {ticker || 'stock'} data...</p>
     </div>
   ) : (
     <CandlestickChart data={data} ticker={ticker} />
   )}
   ```

**Step 2: Update the chart to use server-side indicators**

The API `/indicators` endpoint returns `ma20` and `ma150` fields in each data point. The
chart can now read these directly instead of calculating MA20 client-side.

Update the `OHLCVData` interface in `CandlestickChart.tsx` to accept `ma20`:
```typescript
export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma150: number | null;
  ma20: number | null;
}
```

Then update the MA20 section in the chart's `useEffect`:
- Remove the `import { calculateMA20 } from '@/utils/indicators'` line
- Remove `const ma20Values = calculateMA20(data)`
- Replace the MA20 data preparation to read from the data directly (same pattern as MA150):
  ```tsx
  const ma20Data = data
    .filter((d) => d.ma20 != null)
    .map((d) => ({ time: d.date as string, value: d.ma20 as number }));
  ```

> "See what happened? The MA20 calculation moved from the browser to the server. The frontend
doesn't compute it anymore — the API returns it pre-calculated. Backend computes, frontend
renders. Clean separation."

NOTE: The `calculateMA20` utility and its tests in `frontend/src/utils/indicators.ts` still
exist and still pass — they're just not used by the chart anymore. That's fine. Don't delete
them.

**Step 3: The refresh**

Check if the dev server is running — do NOT ask the student:
- Run `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` to check port 5173
- Also check alt ports: 5174, 5230 (the project uses hash-based port assignment)
- If NOT running: start it yourself (`cd frontend && npm run dev`), wait for it, note the port
- If running: proceed silently

> "Open your browser and refresh."

Wait for the student to see it.

> "Same chart. Same indicators. Same toggles. But that's real [TICKER] data — not mock NVDA
from a JSON file. Everything you built in the last hour just connected."

If the chart looks right, pause and let it land. This is the wow moment.

> "The mock-to-real transition happened in a single file change. That's the power of building
with clean interfaces — the chart doesn't care where its data comes from. Mock JSON, real API,
it all looks the same to the component."

---

## Completing the lesson

Once all checkpoints pass:
1. Update `progress.json`: set lesson `"2"` to `"complete"`, lesson `"3"` to `"active"`

> "Lesson 2 done. You went from mock data to a real pipeline: Yahoo to database to API to
chart. The infrastructure was pre-built. The interesting parts — provider pattern, cache-first
strategy, API design — those are yours now. Type `/lesson-3` when you're ready."

---

## Hard checkpoints

Before marking lesson 2 complete, verify ALL of these:

- [ ] Docker containers running (`./scripts/dc.sh ps` shows postgres-dev and backend-dev healthy)
- [ ] Health endpoint responds with 200
- [ ] `backend/app/models/stock_price.py` exists with `StockPrice` model
- [ ] Alembic migration exists in `backend/alembic/versions/` and is applied
- [ ] `backend/app/providers/base.py` exists with `StockDataProvider` abstract class
- [ ] `backend/app/providers/yahoo.py` exists with `YahooFinanceProvider`
- [ ] `backend/app/services/data_service.py` exists with `DataService`
- [ ] `curl http://localhost:$BACKEND_PORT/api/v1/stocks/{TICKER}/prices` returns OHLCV data
- [ ] `curl http://localhost:$BACKEND_PORT/api/v1/stocks/{TICKER}/indicators` returns data with `ma20` and `ma150` fields
- [ ] `AnalysisPage.tsx` has NO mock data import — data comes from API
- [ ] Student's ticker (from `student.json`) appears on the chart
- [ ] Chart displays real data (not NVDA mock data)
- [ ] `student.json` has both `name` and `ticker` fields
- [ ] `progress.json` updated: lesson 2 complete, lesson 3 active

If any checkpoint fails, fix it before marking complete.

---

## Failure modes

**Docker won't start:**
- Check Docker Desktop is running
- Try `./scripts/dc.sh down` first, then `./scripts/dc.sh up -d`
- Check port conflicts: `lsof -i :$POSTGRES_PORT` and `lsof -i :$BACKEND_PORT`
- Check logs: `./scripts/dc.sh logs backend-dev --tail 50`

**Alembic migration fails:**
- Check that `StockPrice` is imported in `backend/app/models/__init__.py`
- Alembic's `env.py` imports from `app.models` — it's pre-configured
- Run `./scripts/dc.sh exec backend-dev alembic heads` to check migration state
- Nuclear option: `./scripts/dc.sh exec backend-dev alembic downgrade base` then retry

**Yahoo Finance returns no data:**
- Symbol might be invalid — try AAPL to verify the provider works
- yfinance can be flaky — check the error message for clues
- Test directly: `./scripts/dc.sh exec backend-dev python -c "import yfinance as yf; print(yf.download('AAPL', period='5d'))"`
- Rate limiting: wait 60 seconds and retry

**API returns 500:**
- Check logs: `./scripts/dc.sh logs backend-dev --tail 50`
- Common causes: missing import, DB connection error, unhandled provider exception
- Run tests: `./scripts/dc.sh exec backend-dev pytest -x`

**Frontend shows loading forever:**
- Open DevTools → Network tab. Is the API request being made?
- Check Vite proxy: the `/api` prefix should forward to the backend port
- Verify `.env.dev` has correct BACKEND_PORT and Vite is reading it
- Check CORS: backend allows the frontend's port (see `cors_origins` in `config.py`)

**Chart renders but looks wrong:**
- Check API response format matches `OHLCVData` interface exactly
- Field names must be lowercase: `date`, `open`, `high`, `low`, `close`, `volume`, `ma150`, `ma20`
- Dates must be "YYYY-MM-DD" strings, not timestamps

**First API request is very slow (10+ seconds):**
> "That's Yahoo downloading a year of data. Every request after this will be instant —
the data is cached in your database now."

**Student asks "why not call Yahoo directly from React?":**
> "Three reasons: API keys shouldn't live in the browser, you'd hit Yahoo's rate limits
immediately with every page refresh, and there's no caching. The backend handles all of that."

**Student asks "what's the point of the database?":**
> "Speed and reliability. Yahoo is slow and rate-limited. Your database is local and instant.
First request: a few seconds. Every request after: milliseconds. That's cache-first."

**Student asks "what if Yahoo changes their API?":**
> "That's exactly why we used the provider pattern. Yahoo's implementation is isolated in one
file. Swap it out, everything else keeps working. You'd write a new provider class and change
one line of code."

---

## Rules

- NEVER skip Part 1 (infrastructure + ticker) — the student needs to see the pre-built pieces
- NEVER build without explaining the pattern — provider pattern and cache-first ARE the lesson
- NEVER use `docker compose` directly — always `./scripts/dc.sh`
- NEVER hardcode the backend port — always read from `.env.dev`
- NEVER skip the curl verification in Part 3 — the student must see the API working before the frontend switch
- ALWAYS use the student's chosen ticker, not a default
- ALWAYS explain why we cache (rate limiting, speed, reliability)
- ALWAYS let the wow moment breathe — don't rush past the first real-data render
- Lines marked with `>` are spoken to the student — output them naturally, never output the `>` symbol
- NEVER use emoji
- Keep responses concise — pair programmer, not a textbook
