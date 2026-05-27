# Email Responder Routine

This is the **playbook** an agent follows on every run — manually now, or on a remote
schedule later. It wraps the [`email-responder` skill](SKILL.md) (voice + scenario
classification) and adds three things the skill alone does not do:

1. **Inbox scanning** — finds unreplied human emails from the last 7 days.
2. **Saving to Gmail Drafts** — so you review in Gmail, not just in chat.
3. **Learning over time** — reads how you've replied to each person before and stores
   per-person notes in [`learned-styles/`](learned-styles/) that get re-read every run.

> The skill's hard rule "never save to Gmail drafts" is the skill's *review-only* default.
> This routine is the layer that is explicitly authorised to save **drafts** (never to send).

---

## Tools this routine uses

Gmail connector (already authorised — no OAuth setup):
- `search_threads` — find inbox candidates and past sent replies
- `get_thread` — read full message bodies
- `list_drafts` — avoid creating duplicate drafts on re-runs
- `create_draft` — save the reply into Gmail Drafts (with `replyToMessageId`)

Local files (this repo):
- `references/*.md` — the FCC voice + per-scenario drafting rules (from the skill)
- `learned-styles/<person-slug>.md` — accumulated per-person style notes
- `logs/run-YYYY-MM-DD.md` — what was drafted each run

---

## Run steps

### Step 1 — Find reply-worthy emails (last 7 days)
Call `search_threads` with:

```
in:inbox newer_than:7d -category:promotions -category:updates -category:forums -category:social -from:noreply -from:no-reply -from:notifications -from:notification -in:draft
```

Then keep only **real human emails that still need a reply**. Drop a thread if:
- The **last message in the thread is from me** (already replied — check the sender of the
  newest message). This is the key "unreplied" test.
- It's a newsletter, receipt, calendar invite, or automated platform mail (Stripe, Notion,
  Slack, GitHub, LinkedIn, etc.) that slipped through the query.

If nothing qualifies, write a short "nothing to draft" line to today's log and stop.

### Step 2 — Read each candidate in full
For each surviving thread, call `get_thread` (FULL_CONTENT) to get the latest inbound
message body, the sender's email, and the **message id of the latest message** (needed for
`replyToMessageId` so the draft threads correctly).

### Step 3 — Skip anything already drafted
Call `list_drafts` (or search drafts for the subject). If a draft already exists for this
thread/subject, skip it — don't create duplicates on a re-run.

### Step 4 — Learn the relationship (the "learn over time" step)
For each sender, before drafting:
1. Derive a slug from their email: `jane.smith@club.com` → `jane-smith-club-com`.
2. If `learned-styles/<slug>.md` exists, **read it** — it captures how you've replied to
   this person before (formality, greeting, sign-off, recurring topics, do's/don'ts).
3. Pull your own past replies to this person:
   ```
   from:me to:<sender-email> in:sent
   ```
   Read 2–3 of the most recent with `get_thread`. Note: greeting style, sign-off, length,
   warmth, first-name usage, any commitments/context you should carry forward.
4. **Write or update** `learned-styles/<slug>.md` using the template in
   [`learned-styles/_TEMPLATE.md`](learned-styles/_TEMPLATE.md). This is what makes the
   routine improve over time — every run sharpens the per-person profile.

If there's no prior history, note "first contact — no prior replies" and fall back to the
skill's default FCC voice.

### Step 5 — Classify + draft (use the skill)
Follow the [`SKILL.md`](SKILL.md) process:
- Classify into ONE scenario (student question, complaint, partnership, enrolment, refund,
  holding reply). If it fits none, **flag it in the log and skip** — never force-fit.
- Read the matching `references/<scenario>.md` in full and apply its drafting checklist.
- Draft in Yasmin's voice, **blended with the per-person notes** from Step 4.
- **Never invent specifics** (dates, prices, deposit amounts, staff names, availability).
  Use clearly-marked placeholders like `[INTAKE DATE]`, `[£XXX]` and list them in the log.

### Step 6 — Save the draft to Gmail
Call `create_draft` with:
- `to`: the sender's plain email address
- `subject`: `Re: <their subject>`
- `body`: the drafted reply
- `replyToMessageId`: the latest message id from Step 2 (keeps it in-thread)

Do **not** send. Drafts only.

### Step 7 — Log the run
Append to `logs/run-YYYY-MM-DD.md` one entry per email:
- Sender, subject, scenario, confidence
- Whether a learned-style file was used/created
- Draft id returned by `create_draft`
- Any placeholders that need filling

### Step 8 — Report back
Summarise in chat / run output: how many threads scanned, how many drafted, which were
skipped and why, and any drafts that contain placeholders needing your attention.

---

## Hard rules (carry over from the skill)
1. **Drafts only — never send.**
2. **Never invent specifics** — placeholders + flag them.
3. **Never force-fit** an email into a scenario — flag and skip.
4. Opener `Hi [FirstName],`; sign-off `Best wishes,` then `Yasmin`. British English.
5. **One draft per thread** — dedupe against existing drafts before creating.

---

## Running this routine

**Manually (now):** in a session with the Gmail connector, say
*"run the email responder routine"* (or open this repo and point me at `ROUTINE.md`).

**Remotely on a schedule (later):** turn this into a Cowork scheduled routine so it runs in
the cloud on a cron (e.g. weekday mornings) against this repo, saving drafts unattended.
See [`README.md`](README.md#scheduling-it-remotely) for the steps.
