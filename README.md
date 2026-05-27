# Email Responder Routine

Drafts email replies in the **FCC / Yasmin voice**, saves them straight to your **Gmail
Drafts** for review, and **learns over time** from how you've replied to each person before.

It runs on the **Gmail connector** (already authorised in Cowork — no OAuth or API keys to
set up). You can run it manually now, or schedule it to run remotely later against this repo.

## How it works

```
Gmail inbox ──► scan unreplied human emails (last 7d)
                       │
                       ▼
        learned-styles/<person>.md  ◄── reads your past Sent replies to that person
                       │
                       ▼
        email-responder skill  ──► classify scenario + draft in FCC voice
                       │
                       ▼
               Gmail Drafts  ◄── create_draft (never sends)
                       │
                       ▼
        logs/run-YYYY-MM-DD.md + updated learned-styles/<person>.md
```

The full step-by-step is in **[ROUTINE.md](ROUTINE.md)** — that's the playbook the agent
follows on every run.

## What's in this repo

| Path | Purpose |
|---|---|
| **[ROUTINE.md](ROUTINE.md)** | The routine playbook — scan → learn → draft → save → log |
| **[SKILL.md](SKILL.md)** | The `email-responder` skill — FCC voice + scenario classification |
| **[references/](references/)** | Per-scenario voice & drafting rules (student, complaint, partnership, enrolment, refund, holding reply) |
| **[learned-styles/](learned-styles/)** | Per-person style memory the routine reads & updates each run |
| **[logs/](logs/)** | A markdown log per run of what was drafted |
| `legacy/` *(see below)* | The earlier GitHub Actions + Node.js attempt, kept for reference |

## Running it manually (now)

In a session with the Gmail connector available, just say:

> **"Run the email responder routine."**

The agent will scan the last 7 days, draft replies into Gmail Drafts, update the
learned-styles profiles, and report back which drafts need a placeholder filled in. You
review and send from Gmail.

## Scheduling it remotely (later)

When you're ready to have it run unattended (e.g. every weekday morning), turn it into a
**Cowork scheduled routine**:

> **"Schedule the email responder routine to run every weekday at 8am."**

That creates a remote agent that, on each cron tick, checks out this repo, runs
[ROUTINE.md](ROUTINE.md) against your Gmail, saves drafts, and commits the updated
`learned-styles/` and `logs/` back — so the learning persists between runs. Because the
schedule and learning both live here, the repo is the single source of truth.

## Voice & rules (from the skill)

- British English, contractions, warm but not gushing.
- Opener `Hi [FirstName],`; sign-off `Best wishes,` then `Yasmin`.
- Never invent specifics (dates, prices, names) — uses `[PLACEHOLDERS]` and flags them.
- Six scenarios: student/member question, complaint, partnership, enrolment, refund,
  holding reply. Anything else is flagged, never force-fitted.
- **Drafts only — never sends.**

To change the voice, edit the relevant file in [references/](references/), or hand-edit a
person's file in [learned-styles/](learned-styles/) to correct the routine.

---

### Legacy: GitHub Actions + Node.js approach

The original `email-responder.js` + `.github/workflows/` ran on GitHub Actions using the
Anthropic API and a Google **service account**. It has been superseded because:

- It didn't use the skill's reference files (the FCC voice was lost).
- It had no "learn over time" step.
- A Google service account **cannot read a personal `@gmail.com` mailbox**, so the Gmail
  auth could not work as written.

Those files are kept (unmodified) for reference but are **not** the active path. The
connector-based routine above replaces them.
