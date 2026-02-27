# Claude Code Tutorials

Learn to build real applications with AI — by using AI to teach you.

This is a collection of interactive tutorials that run entirely inside
[Claude Code](https://claude.ai/code). No videos. No slides. You open your
terminal, type a command, and Claude guides you through building something real.

Each tutorial is a self-contained project. Claude acts as your pair programmer —
explaining, writing code, verifying your work, and keeping you on track.

---

## Prerequisites

**Claude Code** — Anthropic's CLI for working with Claude from your terminal.

```bash
npm install -g @anthropic/claude-code
```

Requires an Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

Full setup guide: [claude.ai/code](https://claude.ai/code)

**Docker Desktop** — required for tutorials that run a local backend or database.
Install: [docs.docker.com/get-docker](https://docs.docker.com/get-docker)

---

## Tutorials

### Trading Dashboard

**Level:** Junior developer
**Time:** ~6 hours across 6 lessons
**Stack:** React · FastAPI · PostgreSQL · TradingView Lightweight Charts

Build a professional stock analysis dashboard from scratch — candlestick charts,
technical indicators, real market data, and a stock screener. The entire course
runs as Claude Code skills.

**What you'll learn:**
- Prompting Claude to generate UI from a plain description
- Reading and extending unfamiliar code
- Writing tests alongside every component you build
- Connecting a React frontend to a real database
- Debugging with Claude as your pair programmer
- Building a complex feature from a vague idea to working code

**Get started:**

```bash
git clone https://github.com/dimakrest/claude-code-tutorials.git
cd claude-code-tutorials/trading-dashboard
claude
/introduce
```

---

## How it works

Every tutorial is a set of Claude Code skills — commands that put Claude into
teacher mode. You type a command, Claude guides you through the next piece of
the app, writes tests alongside every component, and doesn't move on until
things actually work.

Claude doesn't just write code for you. It asks what you want, explains what
it's doing, and checks that things work before moving on. You're a participant,
not a spectator.

---

## Contributing

More tutorials coming. If you build something worth teaching, open a PR.

---

## License

MIT
