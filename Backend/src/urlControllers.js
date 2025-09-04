import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { oAuth2Client } from "./services/auth.js";
import axios from "axios";
import dotenv from "dotenv";
import db from "./config/db.js";
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
      maxResults: 2,
      labelIds: ["INBOX"],
    });

    const messages = result.data.messages || [];
    if (messages.length === 0) return res.json({ summary: "No emails found" });

    // 3. Fetch full message details and decode
    const mails = [];
    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
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
          model: "moonshotai/kimi-k2:free",
          messages: [
            {
              role: "user",
              content: `You are an AI assistant. Analyze the following email and provide:

1. A **clear, concise summary** in bullet points (1-2 sentences per point).  
2. Any **events mentioned**, with their name, date, time, and venue in a JSON array.  

Requirements:
- Exclude greetings, signatures, or irrelevant text.
- If no events are found, return an empty array for events.

Email:
From: ${mail.from}
Subject: ${mail.subject}
Body: ${mail.body}

Return the result in the following JSON format:

{
  "summary": ["bullet point 1", "bullet point 2", "..."],
  "events": [
    {
      "event": "Event Name",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "venue": "Location"
    }
  ]
}`,
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
    res.json({ summaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// export const summary = async (req, res, text) => {
//   const { content } = req.body;
//   if (!content) {
//     return res.status(400).json({ error: "All fields required" });
//   }
//   try {
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "moonshotai/kimi-k2:free",
//         messages: [
//           {
//             role: "user",
//             content: content,
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPEN_AI_API}`,
//           "HTTP-Referer": "https://your-site.com", // optional
//           "X-Title": "My Cool App", // optional
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return res.json({ message: response.data.choices[0].message.content });
//   } catch (error) {
//     return res.json({ error: error.message });
//   }
// };
