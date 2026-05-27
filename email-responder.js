import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

let gmail;

async function initializeGmail() {
  try {
    const credentialsJson = process.env.GMAIL_CREDENTIALS;
    if (!credentialsJson) {
      throw new Error("GMAIL_CREDENTIALS environment variable not set");
    }

    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify"
      ]
    });

    gmail = google.gmail({
      version: "v1",
      auth
    });

    console.log("✓ Gmail authenticated successfully");
  } catch (error) {
    console.error("✗ Gmail authentication failed:", error.message);
    process.exit(1);
  }
}

async function getUnreadEmails(query = "is:unread") {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 10
    });

    return response.data.messages || [];
  } catch (error) {
    console.error("Error fetching emails:", error.message);
    return [];
  }
}

async function getEmailDetails(messageId) {
  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full"
    });

    const payload = response.data.payload;
    const headers = payload.headers;

    const getHeader = (name) => headers.find(h => h.name === name)?.value || "";

    let body = "";
    if (payload.parts) {
      const textPart = payload.parts.find(p => p.mimeType === "text/plain");
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    } else if (payload.body.data) {
      body = Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    return {
      id: messageId,
      from: getHeader("From"),
      to: getHeader("To"),
      subject: getHeader("Subject"),
      date: getHeader("Date"),
      body: body.substring(0, 2000) // Limit to first 2000 chars
    };
  } catch (error) {
    console.error(`Error getting email details for ${messageId}:`, error.message);
    return null;
  }
}

async function generateResponse(email) {
  try {
    const systemPrompt = `You are Yasmin, drafting email replies in your own voice based on a library of reference scenarios.

# Your voice and rules (NEVER break these):
1. British English always — no American spellings
2. Contractions throughout, warm but not gushing
3. Always open with: "Hi [FirstName]," (never "Hello" or "Hey")
4. Always close with: "Best wishes," on one line, then "Yasmin" on the next
5. Never invent specifics (dates, prices, names) — use [PLACEHOLDER] and flag them
6. Keep responses under 200 words, concise and clear
7. Match the tone of the incoming email — be professional and helpful

# Email scenarios to classify into:
1. **Student / member question** — Prospective or current asking about course content, schedule, intake, prior experience
2. **Complaint / concern** — Raising issues with course quality/delivery/value (NOT refund request)
3. **Partnership / collab inquiry** — Partnership pitch, podcast invite, club/sponsor inquiry
4. **Enrolment query** — Ready to sign up, asking final practical questions
5. **Refund request** — Explicitly asking for refund/cancellation/withdrawal
6. **Holding reply** — Need to acknowledge fast without full answer ("got it, more soon")

# Process:
1. Classify the email into ONE scenario above
2. Draft a reply in your voice that matches the scenario
3. Flag any [PLACEHOLDERS] that need Yasmin's specific info
4. Keep it friendly, helpful, and professional`;

    const userPrompt = `Classify and draft a reply to this email:

From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}

Message:
${email.body}

---

Respond in this format:
**Scenario:** [which scenario this matches]
**Draft:**
[Your reply here, starting with "Hi [FirstName]," and ending with "Best wishes," then "Yasmin"]

Only output the scenario classification and draft body. No other text.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    return response.content[0].type === "text" ? response.content[0].text : null;
  } catch (error) {
    console.error("Error generating response:", error.message);
    return null;
  }
}

async function saveDraft(email, responseText) {
  try {
    // Parse the response to extract scenario and draft
    // Format is: **Scenario:** [type]\n**Draft:**\n[content]
    const scenarioMatch = responseText.match(/\*\*Scenario:\*\*\s*(.+)/);
    const draftMatch = responseText.match(/\*\*Draft:\*\*\s*([\s\S]+)/);
    
    const scenario = scenarioMatch ? scenarioMatch[1].trim() : "Unknown";
    let draftBody = draftMatch ? draftMatch[1].trim() : responseText;
    
    // Clean up any remaining markdown
    draftBody = draftBody.replace(/\*\*/g, "").trim();

    const extractEmail = (emailString) => {
      const match = emailString.match(/<(.+?)>/);
      return match ? match[1] : emailString.split("<")[0].trim();
    };

    const toEmail = extractEmail(email.from);

    const message = [
      `To: ${toEmail}`,
      `Subject: Re: ${email.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      draftBody
    ].join("\r\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage
        }
      }
    });

    return { success: true, scenario };
  } catch (error) {
    console.error("Error saving draft:", error.message);
    return { success: false, scenario: "Error" };
  }
}

async function markAsRead(messageId) {
  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"]
      }
    });
  } catch (error) {
    console.error(`Error marking email as read:`, error.message);
  }
}

async function logProcessing(email, status, responsePreview) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    from: email.from,
    subject: email.subject,
    status,
    responsePreview: responsePreview ? responsePreview.substring(0, 100) : "N/A"
  };

  const logFile = path.join(__dirname, "processing.log.json");
  let logs = [];

  if (fs.existsSync(logFile)) {
    const content = fs.readFileSync(logFile, "utf-8");
    logs = JSON.parse(content || "[]");
  }

  logs.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
  console.log("\n📧 Email Responder Started");
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  try {
    await initializeGmail();

    const unreadEmails = await getUnreadEmails();
    console.log(`📬 Found ${unreadEmails.length} unread email(s)\n`);

    if (unreadEmails.length === 0) {
      console.log("✓ No unread emails to process");
      process.exit(0);
    }

    let processed = 0;
    let drafted = 0;

    for (const msg of unreadEmails) {
      const email = await getEmailDetails(msg.id);

      if (!email) {
        continue;
      }

      console.log(`\n📨 Processing email from: ${email.from}`);
      console.log(`   Subject: ${email.subject}`);

      const response = await generateResponse(email);

      if (response) {
        const result = await saveDraft(email, response);

        if (result.success) {
          await markAsRead(msg.id);
          await logProcessing(email, "drafted", response);
          console.log(`   ✓ Draft saved [${result.scenario}] (marked as read)`);
          drafted++;
        } else {
          console.log(`   ✗ Failed to save draft`);
        }
      } else {
        console.log(`   ✗ Failed to generate response`);
      }

      processed++;

      // Add small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n\n✅ Processing Complete`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Drafts created: ${drafted}`);
    console.log(`   Review drafts in Gmail before sending\n`);

    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
