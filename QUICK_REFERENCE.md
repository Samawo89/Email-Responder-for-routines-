# Quick Reference

## Running Tests

### Local Testing
```bash
# Set your environment variables first:
export ANTHROPIC_API_KEY="sk-ant-..."
export GMAIL_CREDENTIALS='{"type":"service_account",...}'

# Run locally
npm start

# Or use the test script (Mac/Linux)
chmod +x test-local.sh
./test-local.sh
```

### Manual GitHub Run
1. Go to repo → Actions tab
2. Click "Email Responder" 
3. Click "Run workflow" → "Run workflow"

## Configuration

### Change Schedule
Edit `.github/workflows/email-responder.yml`:

```yaml
on:
  schedule:
    - cron: '*/30 * * * *'  # Change this
```

Cron examples:
- `*/15 * * * *` = Every 15 minutes
- `*/30 * * * *` = Every 30 minutes (default)
- `0 * * * *` = Every hour
- `0 2 * * *` = Daily at 2 AM
- `0 9 * * 1-5` = 9 AM weekdays only

### Change Response Tone
Edit `email-responder.js`, find `systemPrompt`, change the guidelines:

```javascript
const systemPrompt = `You are a helpful AI assistant...`
```

### Filter Email Types
Edit `email-responder.js`, change the query:

```javascript
// All unread (default)
const unreadEmails = await getUnreadEmails();

// Only from specific sender
const unreadEmails = await getUnreadEmails('is:unread from:boss@example.com');

// Only with certain subject
const unreadEmails = await getUnreadEmails('is:unread subject:urgent');

// Only from a label
const unreadEmails = await getUnreadEmails('is:unread label:clients');
```

## Common Tasks

### Check if workflow is running
1. Go to Actions tab
2. See green checkmark = success
3. See red X = error (check logs)

### Download processing logs
1. Actions tab → Select latest run
2. Scroll to "Artifacts"
3. Download `processing-logs.zip`

### Update code
```bash
git add .
git commit -m "Your message"
git push
```
Changes deploy automatically.

### Stop the workflow
1. Actions → Email Responder
2. Click "Disable workflow"
(Re-enable in same place)

### View secrets
**Settings → Secrets and variables → Actions**

To rotate API keys:
1. Generate new key in Anthropic Console
2. Update ANTHROPIC_API_KEY secret
3. Test manually before relying on schedule

## Limits & Quotas

- GitHub Actions: 2,000 minutes/month free (runs every 30 min = ~1,440 min/month)
- Claude API: Pay-per-use (very affordable for email responses)
- Gmail API: Unlimited for personal use
- Drafts stored: Unlimited

## Troubleshooting Checklist

- [ ] ANTHROPIC_API_KEY secret is set
- [ ] GMAIL_CREDENTIALS secret is set (single line JSON)
- [ ] Gmail API is enabled in Google Cloud
- [ ] Service account has permission to access Gmail
- [ ] Node.js version is 18+
- [ ] package.json exists
- [ ] Workflow file exists at `.github/workflows/email-responder.yml`

## Getting Help

1. **Check logs**: Actions tab → Select run → See full output
2. **Test locally**: Run `npm start` with credentials set
3. **Verify secrets**: Settings → Secrets (don't show values, just names)
4. **Google Cloud**: Make sure Gmail API is enabled
5. **Anthropic**: Verify API key from console.anthropic.com

## Security Reminders

✅ Always use secrets (never hardcode keys)
✅ Keep `.gitignore` updated
✅ Rotate API keys periodically
✅ Review generated drafts before sending
✅ Don't commit `processing.log.json` to repo

## Commands Reference

```bash
# Install dependencies
npm install

# Run locally
npm start

# Make test script executable (Mac/Linux)
chmod +x test-local.sh

# Check git status
git status

# Commit and push
git add .
git commit -m "message"
git push

# View logs
cat processing.log.json

# Check Node version
node --version
```
