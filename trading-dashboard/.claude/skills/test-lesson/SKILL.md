---
name: test-lesson
description: QA a lesson by running a simulated student through it, then analyzing the results. Usage - /test-lesson 1
---

# /test-lesson — Automated Lesson QA

You are the TEAM LEAD orchestrating a lesson quality test.

This skill launches a team of two agents:
1. **Student** — runs through the lesson as a simulated junior developer
2. **Reviewer** — analyzes the student's experience and suggests improvements

---

## Input

The user provides a lesson number, e.g. `/test-lesson 1`

If no number is provided, ask which lesson to test.

---

## Prerequisites

Before launching the team, verify:
1. The lesson skill exists at `.claude/skills/lesson-{N}/SKILL.md`
2. The `reports/` directory exists (create it if not)
3. Docker services are running if the lesson requires backend (`./scripts/dc.sh up -d`)
4. Frontend dev server is running if the lesson requires it

---

## Team workflow

### Step 1 — Create the team

Create a team called `lesson-{N}-qa`.

### Step 2 — Create tasks

Create these tasks in order:

1. **"Run lesson {N} as student"** — assigned to the student agent
   - Run in an isolated worktree so the main repo stays clean
   - Use the `student` agent type (from `.claude/agents/student.md`)
   - The student must read `.claude/skills/lesson-{N}/SKILL.md` and follow it
   - Output: `reports/lesson-{N}-student-run.md` (written to the MAIN repo, not the worktree)

2. **"Review lesson {N} results"** — assigned to the reviewer agent (blocked by task 1)
   - Use the `reviewer` agent type (from `.claude/agents/reviewer.md`)
   - Reads the student report AND the lesson SKILL.md
   - Output: `reports/lesson-{N}-review.md`

### Step 3 — Launch agents

Spawn the student agent first (in a worktree). When it completes and writes its report,
spawn the reviewer agent.

### Step 4 — Present results

Once both agents complete, read `reports/lesson-{N}-review.md` and present a summary
to the user:

### For you
**"Lesson {N} QA complete. Here's what we found:"**

Then show:
- Overall quality score
- Number of critical / improvement / minor items
- Top 3 most important findings
- Link to full reports in `reports/`

---

## Report location

All reports go in `reports/` at the project root:
```
reports/
  lesson-1-student-run.md
  lesson-1-review.md
  lesson-2-student-run.md
  lesson-2-review.md
  ...
```

---

## Rules

- NEVER modify the lesson being tested — this skill only REPORTS findings
- ALWAYS run the student in a worktree to avoid polluting the main repo
- ALWAYS wait for the student to finish before launching the reviewer
- The reviewer must have access to BOTH the student report and the original SKILL.md
- If the student agent crashes or fails to produce a report, note this as a critical finding
- Present results using the student-facing format from CLAUDE.md
