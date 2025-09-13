import path from "path";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { google } from "googleapis";
import { oAuth2Client } from "../services/auth.js";
import db from "../config/db.js";

dotenv.config();

// Candidate token paths to support different working directories
const TOKEN_CANDIDATES = [
  path.join(process.cwd(), "../token.json"), // if cwd is Backend
  path.join(process.cwd(), "token.json"), // if cwd is repo root
  path.resolve("token.json"),
  path.resolve("..", "token.json"),
];

function resolveTokenPath() {
  for (const p of TOKEN_CANDIDATES) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {}
  }
  // default to repo root guess
  return path.join(process.cwd(), "token.json");
}

const TOKEN_PATH = resolveTokenPath();
const OPEN_AI_MODEL = "deepseek/deepseek-chat-v3.1:free";

function decodeBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  str = str.padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  return Buffer.from(str, "base64").toString("utf-8");
}

function loadTokenOrRespond(res) {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      res
        .status(401)
        .json({ error: "Token not found. Authenticate via /auth." });
      return null;
    }
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    const token = JSON.parse(raw);
    if (!token.access_token) {
      res.status(401).json({ error: "Invalid token. Re-authenticate." });
      return null;
    }
    oAuth2Client.setCredentials(token);
    return token;
  } catch (e) {
    console.error("loadTokenOrRespond error", e);
    res.status(500).json({ error: "Failed to load token", details: e.message });
    return null;
  }
}

export const healthCheck = (req, res) => res.send("App is running");

export const checkGoogleAuth = (req, res) => {
  try {
    const exists = fs.existsSync(TOKEN_PATH);
    if (!exists) return res.json({ authenticated: false });
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    return res.json({ authenticated: Boolean(token?.access_token) });
  } catch (err) {
    return res.json({ authenticated: false });
  }
};

export const summary = async (req, res) => {
  const userId = req.user.id;
  try {
    const token = loadTokenOrRespond(res);
    if (!token) return;

    console.log("Initializing Gmail API...");
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    console.log("Fetching email list from Gmail...");
    const result = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX", "IMPORTANT"],
    });

    console.log(
      "Gmail API returned",
      result.data.messages?.length || 0,
      "messages"
    );

    const messages = result.data.messages || [];
    if (messages.length === 0) return res.json({ summary: "No emails found" });

    const mails = [];
    for (const m of messages) {
      try {
        console.log(`Fetching email details for message ID: ${m.id}`);
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "full",
        });

        // Add detailed logging to understand the response structure
        console.log(`Response for ${m.id}:`, {
          hasResponse: !!msgRes,
          hasData: !!msgRes?.data,
          hasPayload: !!msgRes?.data?.payload,
          dataKeys: msgRes?.data ? Object.keys(msgRes.data) : "no data",
        });

        // Add null checks for the response
        if (!msgRes || !msgRes.data) {
          console.warn(`No response data for message ${m.id}, skipping`);
          continue;
        }

        if (!msgRes.data.payload) {
          console.warn(
            `No payload for message ${m.id}, response keys:`,
            Object.keys(msgRes.data)
          );
          continue;
        }

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

        mails.push({ id: m.id, from, subject, date, body });
        console.log(`Successfully processed email: ${subject}`);
      } catch (emailError) {
        console.error(`Error processing email ${m.id}:`, emailError.message);
        // Continue with other emails even if one fails
        continue;
      }
    }

    console.log(
      `Successfully processed ${mails.length} emails out of ${messages.length} total`
    );

    // Check if we have any emails to process
    if (mails.length === 0) {
      return res.json({
        summary: "No emails could be processed",
        processed: 0,
      });
    }

    // Batch process all emails in a single AI request
    const emailsForAI = mails.map((mail, index) => ({
      id: index + 1,
      emailId: mail.id,
      from: mail.from,
      subject: mail.subject,
      body: mail.body,
      date: mail.date,
    }));

    const batchPrompt = `You are an AI assistant. Analyze the following ${
      emailsForAI.length
    } emails and provide a JSON response with summaries for each email.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.

For each email, provide the output in this exact JSON structure:
{
  "emails": [
    {
      "id": 1,
      "emailId": "actual_email_id",
      "summary": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "events": [
        {
          "name": "Event Name",
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "venue": "Venue Name"
        }
      ],
      "links": ["https://example.com"]
    }
  ]
}

Requirements:
- Provide 4-6 meaningful bullet points for each email summary
- Exclude greetings, signatures, or irrelevant text
- If the mail has social media links like youtube, facebook, etc., omit them
- If there are no events or links, use empty arrays []
- Return ONLY the JSON object, no markdown, no explanations, no code blocks

Emails to analyze:
${emailsForAI
  .map(
    (email) => `
Email ID: ${email.id}
Actual Email ID: ${email.emailId}
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}
Body: ${email.body}
---`
  )
  .join("\n")}`;

    console.log("Making AI API request with", emailsForAI.length, "emails");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: OPEN_AI_MODEL,
        messages: [
          {
            role: "user",
            content: batchPrompt,
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

    console.log("AI API response received successfully");

    let aiResults;
    try {
      let aiContent = response.data.choices[0].message.content;
      console.log("Raw AI response:", aiContent.substring(0, 200) + "...");

      // Remove markdown code blocks if present
      if (aiContent.includes("```json")) {
        aiContent = aiContent
          .replace(/```json\s*/g, "")
          .replace(/```\s*$/g, "");
      } else if (aiContent.includes("```")) {
        aiContent = aiContent.replace(/```\s*/g, "");
      }

      // Clean up any extra whitespace
      aiContent = aiContent.trim();

      console.log("Cleaned AI response:", aiContent.substring(0, 200) + "...");
      aiResults = JSON.parse(aiContent);

      console.log(
        "Successfully parsed AI response with",
        aiResults.emails?.length || 0,
        "emails"
      );
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error(
        "Raw response content:",
        response.data.choices[0].message.content
      );

      // Better fallback with actual email content analysis
      aiResults = {
        emails: mails.map((mail, index) => ({
          id: index + 1,
          emailId: mail.id,
          summary: [
            `Email from: ${mail.from}`,
            `Subject: ${mail.subject}`,
            `Content preview: ${mail.body.substring(0, 100)}...`,
          ],
          events: [],
          links: [],
        })),
      };
      console.log(
        "Using fallback summaries for",
        aiResults.emails.length,
        "emails"
      );
    }

    // Batch insert into database
    const insertPromises = aiResults.emails.map(async (emailResult) => {
      const originalEmail = mails.find((m) => m.id === emailResult.emailId);
      if (!originalEmail) return;

      const summaryText = `Summary:\n${emailResult.summary
        .map((s) => `- ${s}`)
        .join("\n")}${
        emailResult.events.length > 0
          ? `\n\nEvents:\n${emailResult.events
              .map((e) => `- ${e.name}: ${e.date} ${e.time} at ${e.venue}`)
              .join("\n")}`
          : ""
      }${
        emailResult.links.length > 0
          ? `\n\nLinks:\n${emailResult.links.map((l) => `- ${l}`).join("\n")}`
          : ""
      }`;

      return db.query(
        `INSERT INTO emails (email_id, from_email, subject, summary, date, user_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (email_id) DO NOTHING`,
        [
          originalEmail.id,
          originalEmail.from,
          originalEmail.subject,
          summaryText,
          new Date(originalEmail.date),
          userId,
        ]
      );
    });

    await Promise.all(insertPromises);
    res.status(200).json({
      success: "Summarize successful",
      processed: aiResults.emails.length,
    });
  } catch (e) {
    console.error("Summary function error:", e);
    console.error("Error details:", {
      message: e.message,
      stack: e.stack,
      name: e.name,
    });
    res.status(500).json({
      error: e.message,
      details: "Check server logs for more information",
    });
  }
};

export const fetchEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await db.query(
      `SELECT email_id, from_email AS from, subject, summary, date, read, user_id
       FROM emails
       WHERE user_id = $1 AND (is_trashed = false OR is_trashed IS NULL)
       ORDER BY date DESC NULLS LAST`,
      [userId]
    );
    res.json(response.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const isRead = async (req, res) => {
  const { read, emailId } = req.body;
  try {
    const response = await db.query(
      "UPDATE emails SET read=$1 WHERE email_id=$2",
      [read, emailId]
    );
    if (response.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No email updated. Check email_id." });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const addEvent = async (req, res) => {
  const event = req.body;
  if (!event.summary || !event.start || !event.end) {
    return res
      .status(400)
      .json({ error: "Missing required event fields (summary, start, end)" });
  }
  try {
    const token = loadTokenOrRespond(res);
    if (!token) return;
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    res.status(200).json({
      message: "Event created successfully",
      eventLink: response.data.htmlLink,
    });
  } catch (e) {
    console.error("Error creating event", e);
    res
      .status(500)
      .json({ error: "Failed to create event", details: e.message });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const token = loadTokenOrRespond(res);
    if (!token) return;
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const now = new Date();
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });
    if (!Array.isArray(response.data.items)) return res.json({ events: [] });
    const events = response.data.items.map((evt) => ({
      id: evt.id,
      summary: evt.summary || "(No title)",
      start: evt.start?.dateTime || evt.start?.date || null,
      end: evt.end?.dateTime || evt.end?.date || null,
      location: evt.location || null,
      htmlLink: evt.htmlLink || null,
      status: evt.status,
    }));
    res.json({ events });
  } catch (e) {
    console.error("Error fetching upcoming events", e);
    res
      .status(500)
      .json({ error: "Failed to fetch upcoming events", details: e.message });
  }
};

// Trash-related functions
export const fetchTrashedEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await db.query(
      `SELECT email_id, from_email AS from, subject, summary, date, deleted_date, read
       FROM emails
       WHERE user_id = $1 AND is_trashed = true
       ORDER BY deleted_date DESC NULLS LAST, date DESC NULLS LAST`,
      [userId]
    );

    // Transform the data to match the frontend expectations
    const trashedEmails = response.rows.map((email) => ({
      email_id: email.email_id,
      subject: email.subject,
      from: email.from,
      from_email: email.from, // Extract email if needed
      date: email.date,
      summary: email.summary,
      snippet: email.summary ? email.summary.substring(0, 100) + "..." : "",
      deleted_date: email.deleted_date,
      read: email.read || false,
    }));

    res.json(trashedEmails);
  } catch (e) {
    console.error("Error fetching trashed emails:", e);
    res.status(500).json({ error: e.message });
  }
};

export const moveToTrash = async (req, res) => {
  try {
    const { emailId } = req.body;
    const userId = req.user.id;

    if (!emailId) {
      return res.status(400).json({ error: "Email ID is required" });
    }

    const response = await db.query(
      `UPDATE emails 
       SET is_trashed = true, deleted_date = NOW() 
       WHERE email_id = $1 AND user_id = $2`,
      [emailId, userId]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or not authorized",
      });
    }

    res.json({ success: true, message: "Email moved to trash" });
  } catch (e) {
    console.error("Error moving email to trash:", e);
    res.status(500).json({ error: e.message });
  }
};

export const restoreEmail = async (req, res) => {
  try {
    const { emailId } = req.body;
    const userId = req.user.id;

    if (!emailId) {
      return res.status(400).json({ error: "Email ID is required" });
    }

    const response = await db.query(
      `UPDATE emails 
       SET is_trashed = false, deleted_date = NULL 
       WHERE email_id = $1 AND user_id = $2 AND is_trashed = true`,
      [emailId, userId]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found in trash or not authorized",
      });
    }

    res.json({ success: true, message: "Email restored successfully" });
  } catch (e) {
    console.error("Error restoring email:", e);
    res.status(500).json({ error: e.message });
  }
};

export const permanentlyDeleteEmail = async (req, res) => {
  try {
    const { emailId } = req.body;
    const userId = req.user.id;

    if (!emailId) {
      return res.status(400).json({ error: "Email ID is required" });
    }

    const response = await db.query(
      `DELETE FROM emails 
       WHERE email_id = $1 AND user_id = $2 AND is_trashed = true`,
      [emailId, userId]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found in trash or not authorized",
      });
    }

    res.json({ success: true, message: "Email permanently deleted" });
  } catch (e) {
    console.error("Error permanently deleting email:", e);
    res.status(500).json({ error: e.message });
  }
};

export const emptyTrash = async (req, res) => {
  try {
    const userId = req.user.id;

    const response = await db.query(
      `DELETE FROM emails 
       WHERE user_id = $1 AND is_trashed = true`,
      [userId]
    );

    res.json({
      success: true,
      message: `${response.rowCount} emails permanently deleted from trash`,
    });
  } catch (e) {
    console.error("Error emptying trash:", e);
    res.status(500).json({ error: e.message });
  }
};

// Analytics Endpoints
export const getDashboardStats = async (req, res) => {
  try {
    console.log("Dashboard stats request received for user:", req.user);
    const userId = req.user.id;

    // First check if emails table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emails'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("Emails table doesn't exist, returning default stats");
      return res.json({
        totalEmails: 0,
        unreadEmails: 0,
        readEmails: 0,
        readRate: 0,
        trashedEmails: 0,
        todayEmails: 0,
        weekEmails: 0,
        starredEmails: 0,
        attachmentEmails: 0,
        dailyAverage: 0,
      });
    }

    // Check if emails table exists and get basic email counts
    const totalEmailsResult = await db
      .query(
        "SELECT COUNT(*) as total FROM emails WHERE user_id = $1 AND (is_trashed IS NULL OR is_trashed = false)",
        [userId]
      )
      .catch((error) => {
        console.error("Error in totalEmails query:", error);
        throw error;
      });

    const unreadEmailsResult = await db
      .query(
        "SELECT COUNT(*) as unread FROM emails WHERE user_id = $1 AND (read IS NULL OR read = false) AND (is_trashed IS NULL OR is_trashed = false)",
        [userId]
      )
      .catch((error) => {
        console.error("Error in unreadEmails query:", error);
        throw error;
      });

    const trashedEmailsResult = await db
      .query(
        "SELECT COUNT(*) as trashed FROM emails WHERE user_id = $1 AND is_trashed = true",
        [userId]
      )
      .catch((error) => {
        console.error("Error in trashedEmails query:", error);
        throw error;
      });

    // Get today's emails
    const todayEmailsResult = await db.query(
      `SELECT COUNT(*) as today FROM emails 
       WHERE user_id = $1 AND DATE(date) = CURRENT_DATE 
       AND (is_trashed IS NULL OR is_trashed = false)`,
      [userId]
    );

    // Get this week's emails
    const weekEmailsResult = await db.query(
      `SELECT COUNT(*) as week FROM emails 
       WHERE user_id = $1 AND date >= DATE_TRUNC('week', CURRENT_DATE)
       AND (is_trashed IS NULL OR is_trashed = false)`,
      [userId]
    );

    const totalEmails = parseInt(totalEmailsResult.rows[0].total);
    const unreadEmails = parseInt(unreadEmailsResult.rows[0].unread);
    const readRate =
      totalEmails > 0
        ? Math.round(((totalEmails - unreadEmails) / totalEmails) * 100)
        : 0;
    const dailyAverage = await getDailyAverage(userId);

    const stats = {
      totalEmails,
      unreadEmails,
      readEmails: totalEmails - unreadEmails,
      readRate,
      trashedEmails: parseInt(trashedEmailsResult.rows[0].trashed),
      todayEmails: parseInt(todayEmailsResult.rows[0].today),
      weekEmails: parseInt(weekEmailsResult.rows[0].week),
      // starredEmails: parseInt(starredEmailsResult.rows[0].starred),
      // attachmentEmails: parseInt(attachmentEmailsResult.rows[0].attachments),
      dailyAverage,
    };

    console.log("Dashboard stats calculated:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: error.message });
  }
};

export const getEmailAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get top senders
    const topSendersResult = await db.query(
      `SELECT from_email, COUNT(*) as count 
       FROM emails 
       WHERE user_id = $1 AND (is_trashed IS NULL OR is_trashed = false)
       GROUP BY from_email 
       ORDER BY count DESC 
       LIMIT 10`,
      [userId]
    );

    // Get emails by day of week
    const emailsByDayResult = await db.query(
      `SELECT 
         EXTRACT(DOW FROM date) as day_of_week,
         TO_CHAR(date, 'Dy') as day_name,
         COUNT(*) as count
       FROM emails 
       WHERE user_id = $1 AND (is_trashed IS NULL OR is_trashed = false)
       GROUP BY EXTRACT(DOW FROM date), TO_CHAR(date, 'Dy')
       ORDER BY day_of_week`,
      [userId]
    );

    // Get unread emails by age
    const unreadByAgeResult = await db.query(
      `SELECT 
         CASE 
           WHEN DATE(date) = CURRENT_DATE THEN 'today'
           WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 'week'
           WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN 'month'
           ELSE 'older'
         END as age_group,
         COUNT(*) as count
       FROM emails 
       WHERE user_id = $1 AND (read IS NULL OR read = false) 
       AND (is_trashed IS NULL OR is_trashed = false)
       GROUP BY age_group`,
      [userId]
    );

    // Get email activity by hour (if we have time data)
    const emailsByHourResult = await db.query(
      `SELECT 
         EXTRACT(HOUR FROM date) as hour,
         COUNT(*) as count
       FROM emails 
       WHERE user_id = $1 AND (is_trashed IS NULL OR is_trashed = false)
       AND date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY EXTRACT(HOUR FROM date)
       ORDER BY hour`,
      [userId]
    );

    const analytics = {
      topSenders: topSendersResult.rows.map((row) => ({
        sender: row.from_email,
        count: parseInt(row.count),
      })),
      emailsByDay: emailsByDayResult.rows.reduce((acc, row) => {
        acc[row.day_name] = parseInt(row.count);
        return acc;
      }, {}),
      unreadByAge: unreadByAgeResult.rows.reduce(
        (acc, row) => {
          acc[row.age_group] = parseInt(row.count);
          return acc;
        },
        { today: 0, week: 0, month: 0, older: 0 }
      ),
      emailsByHour: emailsByHourResult.rows.map((row) => ({
        hour: parseInt(row.hour),
        count: parseInt(row.count),
      })),
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching email analytics:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getEmailTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "7" } = req.query; // Default to 7 days

    const trendsResult = await db.query(
      `SELECT 
         DATE(date) as email_date,
         COUNT(*) as total_emails,
         COUNT(CASE WHEN read = true THEN 1 END) as read_emails,
         COUNT(CASE WHEN (read IS NULL OR read = false) THEN 1 END) as unread_emails
       FROM emails 
       WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '${period} days'
       AND (is_trashed IS NULL OR is_trashed = false)
       GROUP BY DATE(date)
       ORDER BY email_date DESC`,
      [userId]
    );

    const trends = trendsResult.rows.map((row) => ({
      date: row.email_date,
      totalEmails: parseInt(row.total_emails),
      readEmails: parseInt(row.read_emails),
      unreadEmails: parseInt(row.unread_emails),
      readRate:
        row.total_emails > 0
          ? Math.round((row.read_emails / row.total_emails) * 100)
          : 0,
    }));

    res.json(trends);
  } catch (error) {
    console.error("Error fetching email trends:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate daily average
async function getDailyAverage(userId) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM emails 
       WHERE user_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '7 days'
       AND (is_trashed IS NULL OR is_trashed = false)`,
      [userId]
    );

    const weeklyCount = parseInt(result.rows[0].count);
    return Math.round(weeklyCount / 7);
  } catch (error) {
    console.error("Error calculating daily average:", error);
    return 0;
  }
}
// AI Email Generation
export const generateEmail = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || !preferences.purpose) {
      return res.status(400).json({ error: "Email purpose is required" });
    }

    const { tone, purpose, keyPoints, length } = preferences;

    // Create a detailed prompt for the AI
    const aiPrompt = `You are an expert email writer. Generate a professional email based on the following requirements:

REQUIREMENTS:
- Tone: ${tone}
- Purpose: ${purpose}
- Key Points: ${keyPoints || "None specified"}
- Length: ${length}

INSTRUCTIONS:
1. Generate both a subject line and email body
2. The tone should be ${tone}
3. The email should be ${length} in length
4. Include the key points naturally in the content
5. Use appropriate greetings and closings for the ${tone} tone
6. Make it professional and well-structured
7. Use placeholder [Recipient Name] for the recipient and [Your Name] for the sender

OUTPUT FORMAT:
Subject: [Your generated subject line]

Body:
[Your generated email body]

Please generate the email now:`;

    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: OPEN_AI_MODEL,
        messages: [
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_API}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Parse the AI response to extract subject and body
    const subjectMatch = aiResponse.match(/Subject:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = aiResponse.match(
      /Body:\s*([\s\S]+?)(?:\n\n---|\n\nNote:|$)/i
    );

    let subject = "";
    let body = "";

    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    } else {
      // Fallback: generate a simple subject if parsing fails
      subject = purpose.charAt(0).toUpperCase() + purpose.slice(1);
    }

    if (bodyMatch) {
      body = bodyMatch[1].trim();
    } else {
      // Fallback: use the entire response as body if parsing fails
      body = aiResponse.trim();
    }

    // Clean up the response
    subject = subject.replace(/^["']|["']$/g, ""); // Remove quotes
    body = body.replace(/^["']|["']$/g, ""); // Remove quotes

    res.json({ subject, body });
  } catch (error) {
    console.error("Error generating email:", error);

    // Fallback to a simple generated email if AI fails
    const fallbackEmail = generateFallbackEmail(req.body.preferences);
    res.json(fallbackEmail);
  }
};

// Fallback email generation function
const generateFallbackEmail = (preferences) => {
  const { tone, purpose, keyPoints, length } = preferences;

  let subject = "";
  let body = "";

  // Generate subject based on purpose
  if (purpose.toLowerCase().includes("meeting")) {
    subject = `Meeting Request - ${purpose}`;
  } else if (purpose.toLowerCase().includes("follow up")) {
    subject = `Follow Up: ${purpose}`;
  } else if (purpose.toLowerCase().includes("thank")) {
    subject = `Thank You - ${purpose}`;
  } else {
    subject = purpose.charAt(0).toUpperCase() + purpose.slice(1);
  }

  // Generate body based on tone and length
  const greetings = {
    professional: "Dear [Recipient Name],",
    friendly: "Hi there!",
    formal: "Dear Sir/Madam,",
    casual: "Hey!",
  };

  const closings = {
    professional: "Best regards,\n[Your Name]",
    friendly: "Best,\n[Your Name]",
    formal: "Sincerely,\n[Your Name]",
    casual: "Thanks!\n[Your Name]",
  };

  let bodyContent = "";
  if (length === "short") {
    bodyContent = `I hope this email finds you well. ${purpose}`;
    if (keyPoints) {
      bodyContent += `\n\n${keyPoints}`;
    }
    bodyContent += "\n\nPlease let me know if you have any questions.";
  } else if (length === "medium") {
    bodyContent = `I hope this email finds you well.\n\n${purpose}`;
    if (keyPoints) {
      bodyContent += `\n\nKey points to consider:\n${keyPoints}`;
    }
    bodyContent +=
      "\n\nI would appreciate your feedback on this matter. Please feel free to reach out if you need any additional information.";
  } else {
    // long
    bodyContent = `I hope this email finds you well and that you're having a great day.\n\n${purpose}`;
    if (keyPoints) {
      bodyContent += `\n\nI wanted to highlight the following key points:\n${keyPoints}`;
    }
    bodyContent +=
      "\n\nI believe this would be beneficial for both parties and would love to discuss this further at your convenience. Please don't hesitate to reach out if you have any questions or would like to schedule a time to talk.";
  }

  body = `${greetings[tone] || greetings.professional}\n\n${bodyContent}\n\n${
    closings[tone] || closings.professional
  }`;

  return { subject, body };
};

// Send Email
export const sendEmail = async (req, res) => {
  try {
    const { to, cc, bcc, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res
        .status(400)
        .json({ error: "To, subject, and body are required" });
    }

    const token = loadTokenOrRespond(res);
    if (!token) return;

    oAuth2Client.setCredentials(token);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Check if body contains HTML tags
    const isHtml = /<[a-z][\s\S]*>/i.test(body);

    // Create the email message with headers
    const emailHeaders = [
      `To: ${to}`,
      cc && cc.trim() ? `Cc: ${cc}` : null,
      bcc && bcc.trim() ? `Bcc: ${bcc}` : null,
      `Subject: ${subject}`,
      `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    const emailMessage = emailHeaders + body;

    // Encode the email message
    const encodedMessage = Buffer.from(emailMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send the email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
