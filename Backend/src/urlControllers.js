import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { oAuth2Client } from "./services/auth.js"; // Make sure you export oAuth2Client from auth.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TOKEN_PATH = path.join("../token.json");

function decodeBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(str, "base64").toString("utf-8");
}
export const healthCheck = (req, res) => {
  res.send("App is running");
};

export const summary = async (req, res) => {
  try {
    // Check if token exists
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(401).json({
        error: "Token not found. Please authenticate first via /auth.",
      });
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Get latest 10 message IDs from INBOX only
    const result = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX"],
    });

    const messages = result.data.messages || [];
    const mails = [];
    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
      const payload = msgRes.data.payload;
      const headers = payload.headers;

      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "(Unknown Sender)";
      const date =
        headers.find((h) => h.name === "Date")?.value || "(Unknown Date)";
      let body = "";
      if (payload.parts) {
        const part = payload.parts.find((p) => p.mimeType === "text/plain");
        if (part?.body?.data) {
          body = decodeBase64Url(part.body.data);
        }
      } else if (payload.body?.data) {
        body = decodeBase64Url(payload.body.data);
      }
      mails.push({ subject, from, date, body });
    }
    // res.json({ mails });

    const mailBody = mails
      .map(
        (m, i) =>
          `Email ${i + 1}:\nFrom: ${m.from}\nSubject: ${m.subject}\nBody: ${
            m.body
          }\n`
      )
      .join("\n\n");
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "moonshotai/kimi-k2:free",
        messages: [
          {
            role: "user",
            content: `Summarize the each mails into bullet points ${mailBody}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_API}`,
          "HTTP-Referer": "https://your-site.com", // optional
          "X-Title": "My Cool App", // optional
          "Content-Type": "application/json",
        },
      }
    );
    return res.json({ message: response.data.choices[0].message.content });
  } catch (err) {
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
