# Setup Checklist ✅

Follow these steps in order to get your email responder running.

## Phase 1: Preparation (5 min)

- [ ] You have a GitHub account (create at github.com if not)
- [ ] You have an Anthropic account (create at console.anthropic.com if not)
- [ ] You have a Google Cloud account (create at console.cloud.google.com if not)

## Phase 2: Create Repository (2 min)

- [ ] Go to https://github.com/new
- [ ] Create repo named: `email-responder`
- [ ] Keep it public
- [ ] Click "Create repository"

Note the URL: `https://github.com/YOUR-USERNAME/email-responder`

## Phase 3: Upload Code (3 min)

On your computer:

```bash
git clone https://github.com/YOUR-USERNAME/email-responder.git
cd email-responder
```

Copy these files into the folder:
- [ ] `email-responder.js`
- [ ] `package.json`
- [ ] `.gitignore`
- [ ] `README.md`
- [ ] `QUICK_REFERENCE.md`
- [ ] `test-local.sh`
- [ ] `.github/workflows/email-responder.yml`

Then push:
```bash
git add .
git commit -m "Initial setup"
git push -u origin main
```

- [ ] Files appear in GitHub repo

## Phase 4: Get Anthropic API Key (3 min)

- [ ] Go to https://console.anthropic.com
- [ ] Click "API keys"
- [ ] Click "Create new secret key"
- [ ] Copy the key (starts with `sk-ant-`)
- [ ] Save it somewhere safe temporarily

## Phase 5: Set Up Gmail (10 min)

This is the longest step:

**Enable Gmail API:**
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project: "Email Responder"
- [ ] Search for "Gmail API"
- [ ] Click "Enable"

**Create Service Account:**
- [ ] Go to Credentials (left sidebar)
- [ ] Click "Create Credentials" → "Service Account"
- [ ] Name: `email-responder`
- [ ] Click "Create and Continue"
- [ ] Click "Grant this service account access to project"
- [ ] Role: "Editor"
- [ ] Click "Continue" → "Done"

**Create Key:**
- [ ] Go back to "Credentials"
- [ ] Click the service account you just created
- [ ] Click "Keys" tab
- [ ] Click "Add Key" → "Create new key"
- [ ] Choose "JSON"
- [ ] Download the file

**Convert to Single Line:**

Open the downloaded JSON file and convert it to a single line:

Mac/Linux terminal:
```bash
cat ~/Downloads/[filename].json | tr '\n' ' '
```

Windows PowerShell:
```powershell
Get-Content "C:\Users\[username]\Downloads\[filename].json" | ConvertFrom-Json | ConvertTo-Json -Compress
```

Copy the output (single line JSON)

- [ ] JSON file downloaded
- [ ] Converted to single line
- [ ] Copied to clipboard

## Phase 6: Add GitHub Secrets (3 min)

- [ ] Go to your repo on GitHub
- [ ] Click "Settings" tab
- [ ] Click "Secrets and variables" → "Actions"
- [ ] Click "New repository secret"

**Add Secret #1:**
- [ ] Name: `ANTHROPIC_API_KEY`
- [ ] Value: (paste your API key from Phase 4)
- [ ] Click "Add secret"

**Add Secret #2:**
- [ ] Click "New repository secret" again
- [ ] Name: `GMAIL_CREDENTIALS`
- [ ] Value: (paste the single-line JSON from Phase 5)
- [ ] Click "Add secret"

Verify:
- [ ] Both secrets appear in the list
- [ ] Values are hidden (shown as ••••)

## Phase 7: Test It! (2 min)

- [ ] Go to "Actions" tab in your repo
- [ ] Click "Email Responder" workflow
- [ ] Click "Run workflow" dropdown
- [ ] Click "Run workflow"
- [ ] Wait ~1 minute for it to complete

Check results:
- [ ] Workflow shows green checkmark (success)
- [ ] Click the workflow run to see full logs
- [ ] Look for "✓ Draft saved" messages
- [ ] Go to Gmail and check Drafts folder
- [ ] Should see generated email responses

## Phase 8: Verify Everything Works (1 min)

- [ ] Check Gmail Drafts folder for new responses
- [ ] Review the generated text (should be professional)
- [ ] Check GitHub Actions logs for any errors
- [ ] Look for "Processing Complete" message

## Phase 9: Set Schedule (1 min)

The workflow is already configured to run every 30 minutes. You can change it:

- [ ] Edit `.github/workflows/email-responder.yml`
- [ ] Change the `cron` time if desired
- [ ] Commit and push: 
  ```bash
  git add .github/workflows/email-responder.yml
  git commit -m "Update schedule"
  git push
  ```

## Phase 10: Automatic Operation ✅

From now on:

- [ ] Workflow runs automatically every 30 minutes
- [ ] Checks Gmail for unread emails
- [ ] Generates responses with Claude
- [ ] Saves as drafts (marked as read)
- [ ] You review and send manually
- [ ] Logs saved to processing.log.json

## Optional: Customization

Once it's working, you can customize:

- [ ] Response tone (edit `systemPrompt` in email-responder.js)
- [ ] Email filters (change the Gmail query)
- [ ] Schedule (change the cron time)
- [ ] Max response length (in the Claude API call)

See `README.md` for detailed instructions on each.

## Troubleshooting

If something doesn't work:

**Workflow failed to run:**
- [ ] Check GitHub Actions logs (red output = error)
- [ ] Verify both secrets are set correctly
- [ ] Copy the error message and search for it

**No drafts created:**
- [ ] Make sure you have unread emails in Gmail
- [ ] Check if service account has Gmail permission
- [ ] Verify GMAIL_CREDENTIALS secret is correct JSON

**"Authentication failed" error:**
- [ ] Recreate the service account JSON key
- [ ] Make sure JSON is converted to single line (no newlines)
- [ ] Update the GMAIL_CREDENTIALS secret

**Still stuck:**
- [ ] Try running locally first: `ANTHROPIC_API_KEY=... GMAIL_CREDENTIALS='...' npm start`
- [ ] Check that Node.js is installed: `node --version`
- [ ] Review Google Cloud project settings

---

## You're Done! 🎉

Your email responder is now running 24/7 on GitHub Actions. 

Next steps:
1. Review drafts in Gmail periodically
2. Send the ones you like
3. Customize the tone if needed
4. Sit back and let it work!

Questions? Check `README.md` or `QUICK_REFERENCE.md`
