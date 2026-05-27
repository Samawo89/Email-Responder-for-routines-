---
name: email-responder
description: Scan Yasmin's Gmail inbox, surface real human emails from the last 7 days, let her pick which to reply to, then draft replies in her voice using the bundled scenario references (student/member questions, complaints, partnership inquiries, enrolment queries, refund requests). Use whenever Yasmin says "check my emails", "draft replies", "what's in my inbox", "respond to my emails", "go through my inbox", "scan my inbox", "draft a response to this email", or pastes an inbound email and asks for a reply. Never sends or saves to Gmail drafts — always shows the draft in chat first for review and iteration.
---

# Email Responder

## What this skill does
Drafts email replies in Yasmin's voice using a library of reference replies. Two modes:

1. **Inbox scan mode** — User says "check my emails" / "scan my inbox" / similar. Skill pulls real human emails from the last 7 days, presents a numbered list, user picks which to reply to.
2. **Single email mode** — User pastes an incoming email directly. Skill classifies it, picks the matching reference, drafts the reply.

In both modes, the draft is shown **in chat for review**. Never save to Gmail drafts. Never send. The user iterates with the assistant until the draft is right.

## Step-by-step process

### Step 1 — Decide the mode
- If the user pastes an inbound email in the chat → **Single email mode**, skip to Step 4.
- If the user asks to scan/check/go through emails → **Inbox scan mode**, go to Step 2.
- If unclear, ask.

### Step 2 — Scan the inbox (inbox scan mode only)
Use Gmail's `search_threads` tool with a query that:
- Looks at the last 7 days: `newer_than:7d`
- Is in the inbox: `in:inbox`
- Excludes obvious automated mail: `-category:promotions -category:updates -category:forums -from:noreply -from:no-reply -from:notifications`

Pull thread metadata and skim the first message of each. For each thread, judge whether it's a **real human email worth replying to** vs noise. Skip:
- Newsletters and marketing
- Receipts, notifications, calendar invites
- Automated platform emails (Stripe, Notion, Slack, GitHub, etc.)
- Threads where Yasmin has already replied last (look at the last message sender)

### Step 3 — Present the list and wait for selection
Show the filtered emails as a numbered list. For each, show:
- Sender name + a hint of their identity if knowable
- Subject
- A 1-line summary of what they want
- A scenario guess (which reference would likely apply)

End with: "Which would you like me to draft a reply to? You can pick one, several, or all."

**Stop here and wait for the user.** Do not draft anything until they pick.

### Step 4 — Classify the email
For each email the user wants drafted (or for the single email they pasted), classify it into ONE of the scenarios below. The classification table:

| Scenario | Reference file | Signals |
|---|---|---|
| Student / member question | `references/student-member-question.md` | Prospective or current student asking about course content, schedule, intake, prior experience, missed call follow-up, post-meeting resources |
| Complaint / concern | `references/complaint-or-concern.md` | Raising issues with course quality / delivery / value. Often polite but firm. May mention other students. Wants discussion or solution. NOT asking for a refund. |
| Partnership / collab inquiry | `references/partnership-or-collab-inquiry.md` | Partnership pitch, podcast invite, club/sponsor inquiry, vendor outreach. The default assumption is YES — the reference has three warmth registers (A cold pitch, B media, C warm inbound from a club). |
| Enrolment query | `references/enrolment-query.md` | Ready to sign up, asking final practical questions (intake open? payment plan? what's included?). Language is decided, not exploratory. |
| Refund request | `references/refund-request.md` | Explicitly asking for refund / cancellation / withdrawal. Distinct from a complaint — they want their money back, not just a fix. |
| Holding reply | `references/holding-reply.md` | Yasmin needs to acknowledge fast without a full answer. Use when the email contains info that needs processing (availability, options, decision needed) and a quick warm "got it, more soon" is better than a delay. Also use if Yasmin explicitly asks for a "holding reply" or "buy me time". NOT for complaints, refunds, or conflict. |

**Important — classification rules:**
- If the email is a complaint that ALSO asks for a refund, classify as `refund-request` (the more transactional ask takes priority).
- If the email is a partnership pitch but is clearly off-brand or something we'd want to decline, FLAG to the user — we don't have a polite-decline reference yet.
- If the email doesn't fit any scenario above (e.g. a coach/tutor pitching themselves to teach, a press request without a podcast angle, a legal query), DO NOT force-fit. Tell the user: "This email doesn't match a saved scenario. Want to draft it freehand or skip?"

### Step 5 — Read the reference file
Before drafting, **view the matched reference file** in full. The reference contains:
- Voice and tone rules
- What to do / what NOT to do
- The actual reference reply (or replies)
- A drafting checklist

Treat the checklist at the bottom of each reference as a hard pre-flight check. The draft must pass every item.

### Step 6 — Draft the reply
- Write in Yasmin's voice as captured in the reference.
- British English, contractions throughout, warm but not gushing.
- Default sign-off: `Best wishes,` then `Yasmin` on a new line.
- **Never invent specifics.** If you don't know the actual intake date, deposit amount, course price, current availability, name of a replacement tutor, etc., use a clearly marked placeholder like `[INTAKE DATE]`, `[£XXX]`, `[AVAILABILITY]` and flag these at the end of the draft so Yasmin can fill them in.

### Step 7 — Show the draft for review
Present the draft in chat with this structure:

```
**Scenario:** [scenario name]
**Reference used:** [reference filename]
**Confidence:** [High / Medium / Low — explain briefly if not High]

---

**Subject:** Re: [their subject]

[Draft body here]

---

**Placeholders to fill in:**
- [List anything marked as [PLACEHOLDER] in the draft]

**Notes / things I'm unsure about:**
- [Anything you guessed or made an assumption on]
```

Then ask: "How does this read? Want me to adjust anything?"

### Step 8 — Iterate
- If Yasmin asks for changes, revise the draft and show it again.
- If she's happy, confirm it's ready for her to copy/paste into Gmail.
- **Never save to Gmail drafts. Never send.** The skill is review-only for now.

### Step 9 — Capture new references (optional)
If Yasmin replies to an email herself in a way that's different from any saved reference, offer at the end: "Want me to save your reply as a new reference for this scenario?" Don't push — just offer once.

## Inbox-scan output format (Step 3 example)

```
Here are the real human emails in your inbox from the last 7 days:

1. **Priya Shah** — "Ready to enrol — couple of quick questions"
   Wants to sign up for the Performance Analyst Foundation Course. Asking about intake dates, payment plan, and access to previous guest lectures.
   → Scenario guess: enrolment query

2. **James Holloway (Watford FC)** — "Future Coders Club — possible collaboration"
   Academy lead at Watford. Wants 30 mins to discuss analyst capability development.
   → Scenario guess: partnership/collab inquiry (Register C — warm club inbound)

3. **Aaron Mensah** — "Refund request — Performance Analyst Foundation Course"
   Enrolled 3 weeks ago, attended 2 sessions, says it's more theory than expected. Requesting full refund.
   → Scenario guess: refund request

Which would you like me to draft a reply to? You can pick one, several, or all.
```

## Reference files
All reference files live in `references/` next to this SKILL.md:
- `references/student-member-question.md`
- `references/complaint-or-concern.md`
- `references/partnership-or-collab-inquiry.md`
- `references/enrolment-query.md`
- `references/refund-request.md`
- `references/holding-reply.md`

## Hard rules (never break these)
1. **Never send or save to Gmail drafts.** Always show drafts in chat only.
2. **Never invent specifics** (dates, prices, deposit amounts, staff names, availability). Use placeholders and flag them.
3. **Never force-fit an email into a scenario.** If it doesn't match, say so and ask the user how to proceed.
4. **Never use "Hello" or "Hey"** — opener is always `Hi [FirstName],`.
5. **Never use "Cheers", "Regards", "Thanks"** as sign-off — always `Best wishes,` followed by `Yasmin`.
6. **British English always.** No American spellings.
7. **Apply the per-scenario drafting checklist** at the bottom of each reference file before producing the final draft.

## Out of scope (don't do these)
- Don't read every email in the inbox just to summarise. The job is to surface reply-worthy emails, not give an inbox digest.
- Don't suggest auto-reply automation or rules.
- Don't classify or draft for emails outside the 5 saved scenarios — flag them instead.
- Don't modify references files on the fly. New references are added explicitly via Step 9.
