# Email Responder: Skill Integration Guide

## Overview

Your GitHub email responder now **pulls directly from your email-responder skill** and uses your exact voice, tone, and rules to generate responses.

## What Changed

### Before (Generic Script)
- Generic professional tone
- Basic email response generation
- No scenario classification
- No British English enforcement
- No placeholder handling

### Now (Skill-Integrated Script)
- Uses your voice (British English, contractions, warm but professional)
- Classifies emails into your 6 scenarios
- Follows all your hard rules
- Automatically flags placeholders [LIKE THIS]
- Generates responses exactly as the skill would

## How It Works

### 1. Skill Rules → GitHub Script

Your skill defines these rules:

```
Hard rules (NEVER break these):
1. Never send or save to Gmail drafts (✓ We save as drafts for review)
2. Never invent specifics — use [PLACEHOLDER]
3. Never force-fit an email into a scenario
4. Never use "Hello" or "Hey" — always "Hi [FirstName],"
5. Never use "Cheers", "Regards", "Thanks" — always "Best wishes, Yasmin"
6. British English always
7. Apply per-scenario drafting checklist
```

All of these are **baked into the system prompt** that Claude uses when generating responses.

### 2. Classification System

The script classifies each email into ONE of your scenarios:

| Scenario | Signals |
|---|---|
| Student / member question | Asking about course content, schedule, intake, prior experience |
| Complaint / concern | Issues with course quality/delivery (NOT refund) |
| Partnership / collab inquiry | Partnership pitch, podcast invite, club/sponsor inquiry |
| Enrolment query | Ready to sign up, asking final practical questions |
| Refund request | Explicitly asking for refund/cancellation |
| Holding reply | Need to acknowledge fast ("got it, more soon") |

When Claude generates a response, it outputs:
```
**Scenario:** Enrolment query
**Draft:**
Hi Priya,

Thanks for reaching out...
Best wishes,
Yasmin
```

### 3. Voice Enforcement

The system prompt includes:

```
# Your voice and rules:
1. British English always — no American spellings
2. Contractions throughout, warm but not gushing
3. Always open with: "Hi [FirstName]," (never "Hello" or "Hey")
4. Always close with: "Best wishes," then "Yasmin"
5. Never invent specifics — use [PLACEHOLDER]
6. Keep responses under 200 words
7. Match the tone of the incoming email
```

So responses will ALWAYS:
- Use "colour" not "color"
- Use contractions: "we're", "it's", "don't"
- Start with "Hi [Name],"
- End with "Best wishes," / "Yasmin"
- Mark unknowns as [DATE], [PRICE], [AVAILABILITY], etc.

### 4. Workflow on GitHub

Every 30 minutes:

```
Check Gmail for unread emails
        ↓
For each email:
  → Classify into scenario
  → Generate response using your voice rules
  → Extract scenario + draft text
  → Save as Gmail draft
  → Mark original as read
  → Log what was processed
        ↓
Show summary in logs
```

Drafts appear in your Gmail drafts folder for you to review before sending.

## How to Update Voice/Rules

### Option 1: Ask Me in Chat (Easiest)

Just tell me:
- *"Make my responses more formal"*
- *"Add a new scenario for [type of email]"*
- *"Change my sign-off to [something else]"*
- *"Make responses longer/shorter"*
- *"Update my hard rules to..."*

I'll:
1. Update your skill
2. Update the GitHub script's system prompt
3. Push the changes
4. It applies immediately on the next run

### Option 2: Edit Manually

If you want to edit directly:

1. In your GitHub repo, open `email-responder.js`
2. Find the `generateResponse` function
3. Look for the `systemPrompt` section (starts with "You are Yasmin...")
4. Edit the rules, examples, or hard rules
5. Commit and push

Example change:
```javascript
// Before:
4. Always close with: "Best wishes,"

// After:
4. Always close with: "Warmly,"
```

Any change takes effect on the next scheduled run (or you can run it manually).

## Logging & Monitoring

Each run logs:
- **Timestamp** — When it ran
- **From** — Sender email
- **Subject** — Email subject
- **Status** — "drafted" or failed
- **Scenario** — Which type (if successfully drafted)
- **Response preview** — First 100 chars of the draft

Check logs:
1. Go to GitHub → Actions tab
2. Click the latest "Email Responder" run
3. Scroll to "Artifacts"
4. Download `processing-logs.zip`
5. Open `processing.log.json`

Example entry:
```json
{
  "timestamp": "2026-05-27T09:30:45.123Z",
  "from": "priya@example.com",
  "subject": "Ready to enrol",
  "status": "drafted",
  "scenario": "Enrolment query",
  "responsePreview": "Hi Priya, Thanks for reaching out..."
}
```

## What's NOT Included (Yet)

These features from your skill are **manual in chat only**:

- ❌ Picking which emails to reply to (the script replies to all unread)
- ❌ Single email mode (pasting one email for instant feedback)
- ❌ Real-time iteration (GitHub is batch, not interactive)
- ❌ Offering to save new references (no new scenario creation)

**Why?** GitHub Actions runs on a schedule and can't interact. For those features, use your skill directly in chat by saying *"check my emails"*.

## Syncing Both Systems

You now have two systems:

### Your Skill (In Chat)
- Real-time, on-demand
- Pick which emails to reply to
- See drafts in chat
- Iterate before saving
- Create new references
- Use when: You want to be hands-on

### GitHub Script (24/7)
- Automatic, no input needed
- Processes all unread emails
- Saves drafts in Gmail
- Review in Gmail, then send
- Uses existing scenarios
- Use when: You want it running while you sleep

**They use the same voice & rules**, so you get consistency either way.

## Customization Examples

### Example 1: Change Tone

Current system prompt section:
```javascript
1. British English always — no American spellings
2. Contractions throughout, warm but not gushing
```

Update to:
```javascript
1. British English always — no American spellings
2. Contractions throughout, very warm and enthusiastic
3. Use more emojis in tone (but not actual emoji characters)
```

### Example 2: Add New Scenario

Add to the list:
```javascript
6. **Media inquiry** — Journalist, podcast, or press asking for comment/interview
   Respond warmly, check availability, ask for more details
```

### Example 3: Change Hard Rules

Update the hard rules:
```javascript
5. Always close with: "Cheers," on one line, then "Yasmin" (instead of "Best wishes,")
```

### Example 4: Update Filtering

Change which emails are processed:

```javascript
// Current: all unread
const unreadEmails = await getUnreadEmails();

// Only from specific senders:
const unreadEmails = await getUnreadEmails('is:unread from:students@cohort.example.com');

// Only specific label:
const unreadEmails = await getUnreadEmails('is:unread label:partnerships');

// Exclude certain types:
const unreadEmails = await getUnreadEmails('is:unread -label:promotions -from:noreply');
```

## Troubleshooting

### Responses don't match my voice
- Check the system prompt in `email-responder.js`
- Make sure the hard rules are all there
- Ask me to review and update

### Missing placeholders in draft
- Claude sometimes forgets to add [PLACEHOLDER]
- You can edit the draft in Gmail before sending
- Tell me if it's systematic and I'll tighten the prompt

### Wrong scenario classification
- Claude sometimes misclassifies emails
- You can reclassify when reviewing the draft
- If it's happening often, let me know and I'll add clearer examples

### Workflow not running
- Check GitHub Actions tab for errors
- Verify both secrets are set (ANTHROPIC_API_KEY, GMAIL_CREDENTIALS)
- Try running it manually first

## Security & Privacy

- API keys stored as encrypted GitHub secrets
- Credentials never logged or saved to repo
- Processing logs stored as artifacts (30 days retention)
- Script runs on GitHub servers (you trust GitHub)
- Drafts saved to Gmail (you review before sending)

## Next Steps

1. ✅ Set up GitHub (follow SETUP_CHECKLIST.md)
2. ✅ Add your Anthropic key + Gmail credentials
3. ✅ Test the first run
4. ✅ Review drafts in Gmail
5. ✅ Customize voice/rules as needed
6. ✅ Let it run automatically 24/7

**Questions or want to customize?** Just ask me in chat!
