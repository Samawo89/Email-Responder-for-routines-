# Email Responder Setup Guide

This email responder **pulls directly from your email-responder skill** and generates draft responses in your exact voice using Claude AI. It runs on GitHub Actions, so it works 24/7 even while you sleep.

## How It Works

Your skill defines:
- **Your voice & tone** — British English, contractions, warm but professional
- **Classification system** — 6 email scenarios (student questions, complaints, partnerships, enrolment, refunds, holding replies)
- **Hard rules** — Never invent specifics, always use [PLACEHOLDERS], sign off as "Best wishes, Yasmin"

The GitHub version:
1. Checks Gmail every 30 minutes for unread emails
2. Classifies each email into one of your 6 scenarios
3. Generates a response **in your voice** using those rules
4. Saves as a draft (marked as read) so you review before sending
5. Logs everything for tracking

**Key difference from the skill:** The skill shows drafts in chat for you to pick & iterate. The GitHub version runs automatically 24/7 and saves drafts for you to review in Gmail.

## Quick Start (5 minutes)

### Step 1: Create Your GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `email-responder`
3. Choose "Public" (easier for now)
4. Click "Create repository"

### Step 2: Upload These Files

Clone the repo locally and add these files:

```bash
git clone https://github.com/YOUR-USERNAME/email-responder.git
cd email-responder

# Copy all files from this package into the directory
# You should have:
# - email-responder.js
# - package.json
# - .github/workflows/email-responder.yml
# - .gitignore
# - README.md

git add .
git commit -m "Initial setup"
git push -u origin main
```

### Step 3: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in to your Anthropic account
3. Click "API keys" on the left
4. Create a new API key
5. Copy it (you'll use it in Step 4)

### Step 4: Set Up Gmail OAuth Credentials

**This is the trickiest part, but I'll walk you through it:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name it "Email Responder")
3. Enable these APIs:
   - Gmail API
   - Google Drive API (for storage)

4. Create OAuth credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Desktop application"
   - Download the JSON file

5. Create a service account instead (easier):
   - In Credentials, click "Create Credentials" → "Service Account"
   - Name it "email-responder"
   - Grant it "Editor" role
   - Create a key (JSON format)
   - Download the JSON file

6. Convert the JSON to a single line:
   ```bash
   # On Mac/Linux:
   cat /path/to/downloaded-file.json | tr '\n' ' '
   
   # On Windows PowerShell:
   Get-Content "C:\path\to\file.json" | ConvertFrom-Json | ConvertTo-Json -Compress
   ```

### Step 5: Add GitHub Secrets

1. Go to your GitHub repo
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"

**Add these two secrets:**

**Secret 1: ANTHROPIC_API_KEY**
- Name: `ANTHROPIC_API_KEY`
- Value: (paste your API key from Step 3)

**Secret 2: GMAIL_CREDENTIALS**
- Name: `GMAIL_CREDENTIALS`
- Value: (paste the single-line JSON from Step 4)

### Step 6: Test It

1. Go to your repo → "Actions" tab
2. Click "Email Responder" workflow
3. Click "Run workflow" → "Run workflow"
4. Watch the logs in real-time
5. Check your Gmail drafts folder for generated responses

### Step 7: Schedule It (Automatic)

The workflow is already set to run every 30 minutes. To change the schedule, edit `.github/workflows/email-responder.yml`:

```yaml
on:
  schedule:
    # Examples:
    - cron: '*/15 * * * *'   # Every 15 minutes
    - cron: '0 * * * *'      # Every hour
    - cron: '0 2 * * *'      # Daily at 2 AM
    - cron: '*/30 * * * *'   # Every 30 minutes
```

Then push the change:
```bash
git add .github/workflows/email-responder.yml
git commit -m "Update schedule"
git push
```

## How It Works

1. **GitHub Actions triggers** → Every 30 minutes
2. **Script checks Gmail** → Looks for unread emails
3. **Claude generates responses** → Uses AI to draft replies
4. **Saves as drafts** → Emails are marked as read but saved as drafts
5. **Logs activity** → Records what was processed

## Customizing Responses

The email responder uses your skill's voice and rules. To update how it responds, you have two options:

### Option 1: Update in Chat (Easiest)
Ask me: *"Update my email responder voice to..."* and I'll:
1. Update your skill instructions
2. Update the GitHub script to match
3. Push the changes automatically

### Option 2: Edit the GitHub Script Directly
Edit the `systemPrompt` in `email-responder.js` (the section between the backticks that starts with "You are Yasmin...").

Examples:
```javascript
// Change tone
const systemPrompt = `You are Yasmin, but more formal...`

// Add new scenarios
6. **New scenario type** — Description here

// Update hard rules
5. Always close with: "Cheers, Yasmin" (instead of "Best wishes")
```

Then push:
```bash
git add email-responder.js
git commit -m "Update response voice"
git push
```

## Filtering Specific Emails

By default, it processes all unread emails. To filter only certain emails, modify this line in `email-responder.js`:

```javascript
// Current: all unread
const unreadEmails = await getUnreadEmails();

// Only emails from specific senders:
const unreadEmails = await getUnreadEmails('is:unread from:boss@company.com');

// Only emails with certain words:
const unreadEmails = await getUnreadEmails('is:unread subject:project');

// Only from a specific label:
const unreadEmails = await getUnreadEmails('is:unread label:client-requests');
```

## Monitoring & Logs

Each run creates a `processing.log.json` file with:
- Timestamp
- Email from/subject
- Status (drafted/failed)
- Response preview

You can download logs from the Actions tab → Select a run → Artifacts.

## Troubleshooting

**Workflow runs but no drafts created:**
- Check the logs in the Actions tab
- Make sure GMAIL_CREDENTIALS is set correctly
- Verify the service account has Gmail access

**"Gmail authentication failed" error:**
- Recreate the service account JSON key
- Make sure it's converted to a single line
- Check there are no special characters in the secret

**No emails being processed:**
- Check if you have unread emails in Gmail
- GitHub Actions may have rate limits (2,000 min/month free)
- Try running manually first to debug

## Security Notes

- API keys are stored as encrypted secrets
- Service account credentials are encrypted in transit
- Processing logs are stored as artifacts (not in repo)
- All files are open source on GitHub

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Add secrets
3. ✅ Test manually
4. ✅ Let it run automatically
5. ✅ Review drafts in Gmail before sending
6. ✅ Optional: Modify tone/filters as needed

## Support

If you get stuck:
- Check the GitHub Actions logs (most helpful)
- Verify both secrets are set correctly
- Make sure Gmail API is enabled
- Test locally with: `ANTHROPIC_API_KEY=... GMAIL_CREDENTIALS='...' npm start`

Good luck! 🚀
