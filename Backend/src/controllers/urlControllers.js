import path from "path";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { google } from "googleapis";
import { oAuth2Client } from "../services/auth.js";
import db from "../config/db.js";

dotenv.config();

const TOKEN_PATH = path.join("../token.json");

function decodeBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  str = str.padEnd(str.length + ((4 - (str.length % 4)) % 4), "="); // pad Base64
  return Buffer.from(str, "base64").toString("utf-8");
}

export const healthCheck = (req, res) => {
  res.send("App is running");
};

export const summary = async (req, res) => {
  try {
    // 1. Check token
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(401).json({
        error: "Token not found. Please authenticate first via /auth.",
      });
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // 2. Get latest 10 messages from INBOX
    const result = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX"],
    });

    const messages = result.data.messages || [];
    if (messages.length === 0) return res.json({ summary: "No emails found" });

    // 3. Fetch full message details and decode
    const mails = [];
    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        // maxResults: 10,
        id: msg.id,
        format: "full",
      });

      const payload = msgRes.data.payload;
      const headers = payload.headers || [];

      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "(Unknown Sender)";
      const date =
        headers.find((h) => h.name === "Date")?.value ||
        new Date().toISOString();

      let body = "";
      if (payload.parts) {
        const part = payload.parts.find((p) => p.mimeType === "text/plain");
        if (part?.body?.data) body = decodeBase64Url(part.body.data);
      } else if (payload.body?.data) {
        body = decodeBase64Url(payload.body.data);
      }

      mails.push({ id: msg.id, from, subject, date, body });
    }
    const summaries = [];
    for (const mail of mails) {
      // Call OpenRouter AI for summary
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: [
            {
              role: "user",
              content: `You are an AI assistant. Analyze the following email and provide the output in this structured format:

Summary:
- Bullet point 1
- Bullet point 2
- ...

Events:
- Event Name: ...
  Date: ...
  Time: ...
  Venue: ...

Links:
- https://...

Requirements:
- Exclude greetings, signatures, or irrelevant text.
- If the mail has social media links like youtube, facebook, etc., omit them.
- If there are no events or links, omit the Events or Links section from your response.

Email:
From: ${mail.from}
Subject: ${mail.subject}
Body: ${mail.body}
              `,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPEN_AI_API}`,
            "Content-Type": "application/json",
          },
        }
      );

      const summaryText = response.data.choices[0].message.content;

      // Store in DB (avoid duplicates)
      await db.query(
        `INSERT INTO emails (email_id, from_email, subject, summary, date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email_id) DO NOTHING`,
        [mail.id, mail.from, mail.subject, summaryText, new Date(mail.date)]
      );

      summaries.push({
        emailId: mail.id,
        from: mail.from,
        subject: mail.subject,
        summary: summaryText,
        date: mail.date,
      });
    }

    // 5️⃣ Return all summaries
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchEmails = async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM emails");
    res.json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
