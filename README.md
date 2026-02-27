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
from your terminal.

**Install:**
```bash
npm install -g @anthropic/claude-code
```

Requires an Anthropic API key. Set it:
```bash
export ANTHROPIC_API_KEY=your_key_here
```

Full setup guide: [claude.ai/code](https://claude.ai/code)

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

**Level:** Junior developer
**Time:** ~6 hours across 6 lessons
**Stack:** React · FastAPI · PostgreSQL · TradingView Lightweight Charts

Build a professional stock analysis dashboard from scratch — candlestick charts,
technical indicators, real market data, and a stock screener. The entire course
runs as Claude Code skills. You clone the repo, type `/introduce`, and Claude
takes it from there.

**What you'll learn:**
- Writing effective prompts for UI generation
- Reading and extending existing code patterns
- Connecting a frontend to a real database
- Debugging with Claude Code
- Building complex features from plain descriptions
- Writing tests alongside your code

**Get started:**
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
