# Claude Code Tutorials

Learn to build real applications with AI — by using AI to teach you.

This repo is a collection of interactive tutorials that run entirely inside
[Claude Code](https://claude.ai/code). No videos. No slides. You open your
terminal, type a command, and Claude guides you through building something real.

Each tutorial is a project you clone, run, and build alongside Claude.
Claude acts as your pair programmer — explaining, generating code, verifying
your work, and keeping you on track.

---

## Prerequisites

### Claude Code

Claude Code is Anthropic's CLI tool that lets you work with Claude directly
from your terminal. Requires a [Pro, Max, Teams, or Enterprise](https://claude.ai) subscription.

**Install:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Then run `claude` — it will walk you through signing in via your browser.

Full setup guide: [code.claude.com/docs](https://code.claude.com/docs)

### Docker

Some tutorials require a local database or backend services. Docker handles
all of that without any manual setup.

Install Docker Desktop: [docs.docker.com/get-docker](https://docs.docker.com/get-docker)

Make sure Docker is available in your terminal:
```bash
docker --version
```

---

## Tutorials

### Trading Dashboard

**Level:** Junior developer · **Time:** ~6 hours across 6 lessons
**Stack:** React · FastAPI · PostgreSQL · TradingView Lightweight Charts

Build a professional stock analysis dashboard — candlestick charts, technical indicators,
real market data, and a stock screener. You clone the repo, type `/introduce`, and Claude
takes it from there.

```bash
git clone https://github.com/dimakrest/claude-code-tutorials.git
cd claude-code-tutorials/trading-dashboard
claude
/introduce
```

---

## How it works

Every tutorial is structured as a set of Claude Code skills — markdown files
that put Claude into teacher mode when you invoke them.

```
/introduce    → Claude introduces itself, sets up your environment
/lesson-1     → First guided lesson
/lesson-2     → Next lesson, builds on the previous
...
```

Claude doesn't just write code for you. It asks what you want, explains what
it's doing at a high level, writes tests alongside the code, and checks that
things actually work before moving on. You're a participant, not a spectator.

---

## Contributing

More tutorials coming. If you build something worth teaching, open a PR.

---

## License

MIT
