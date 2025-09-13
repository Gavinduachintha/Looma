import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { googleOAuthHandler } from "./googleOAuth.js";

// Resolve paths independent of where node is started (root vs Backend directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate search paths so we work whether the process is started in repo root or Backend/
const CANDIDATE_ROOTS = [
  process.cwd(), // current working directory
  path.join(process.cwd(), ".."), // parent (if started in Backend/)
  path.join(__dirname, "..", ".."), // ../../ from this file -> repo root if layout unchanged
];

function findFile(basename) {
  for (const root of CANDIDATE_ROOTS) {
    try {
      const full = path.join(root, basename);
      if (fs.existsSync(full)) return full;
    } catch (_) {}
  }
  // Fallback: assume repo root (cwd)
  return path.join(process.cwd(), basename);
}

const CREDENTIALS_PATH = findFile("credentials.json");
const TOKEN_PATH = findFile("token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar",
];

// Load credentials safely (throw early if missing)
let credentialsRaw;
try {
  credentialsRaw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
} catch (e) {
  console.error(
    "Failed to load Google OAuth credentials at",
    CREDENTIALS_PATH,
    e.message
  );
  throw new Error(
    "Google OAuth credentials not found. Place credentials.json in project root."
  );
}
const { client_secret, client_id, redirect_uris } = credentialsRaw.web || {};
export const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/oauth2callback"
);

// Auth route controller
export const auth = async (req, res) => {
  // If token is still valid, don't re-trigger the OAuth consent flow
  try {
    const valid = await isTokenValid();
    if (valid) {
      // Already authenticated — send the user back to the dashboard
      return res.redirect("http://localhost:5173/dashboard?auth=already");
    }
  } catch (err) {
    // If check fails, fall through to starting a new auth flow
    console.error(
      "isTokenValid check failed:",
      err && err.message ? err.message : err
    );
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

// OAuth2 callback controller
export const oauth2callback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const isUserAuth = state && state.includes("user_auth=true"); // Check state parameter for user auth flag

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    if (isUserAuth) {
      // Handle user authentication (sign-in/sign-up)
      const result = await googleOAuthHandler(code);

      if (result.success) {
        // Store Google tokens for Gmail/Calendar access
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(result.tokens));

        // Redirect to frontend with user authentication success
        const redirectUrl = `http://localhost:5173/dashboard?auth=success&token=${encodeURIComponent(
          result.token
        )}&user=${encodeURIComponent(JSON.stringify(result.user))}&new_user=${
          result.isNewUser
        }`;
        res.redirect(redirectUrl);
      } else {
        res.redirect(
          `http://localhost:5173/signin?error=${encodeURIComponent(
            "Authentication failed"
          )}`
        );
      }
    } else {
      // Handle Gmail/Calendar access tokens only
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

      // Redirect back to frontend dashboard with success message
      res.redirect("http://localhost:5173/dashboard?auth=success");
    }
  } catch (err) {
    console.error("OAuth callback error:", err);
    // Redirect back to frontend with error
    const errorRedirectUrl = isUserAuth
      ? `http://localhost:5173/signin?error=${encodeURIComponent(err.message)}`
      : `http://localhost:5173/dashboard?auth=error&message=${encodeURIComponent(
          err.message
        )}`;
    res.redirect(errorRedirectUrl);
  }
};

// Function to check if token.json is valid
export const isTokenValid = async () => {
  try {
    // Read tokens from token.json
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));

    // If expiry_date exists and token is not expired, we are good
    if (tokens.expiry_date && Date.now() < tokens.expiry_date) {
      oAuth2Client.setCredentials(tokens);
      return true;
    }

    // Token expired or no expiry_date: try to refresh using the refresh_token
    if (tokens.refresh_token) {
      try {
        // refreshToken returns an object with credentials on success
        const refreshResponse = await oAuth2Client.refreshToken(
          tokens.refresh_token
        );
        // Different google versions return the refreshed tokens in different shapes
        const newTokens =
          refreshResponse.credentials ||
          refreshResponse.tokens ||
          refreshResponse;

        // Ensure refresh_token is preserved if provider didn't return it
        if (!newTokens.refresh_token)
          newTokens.refresh_token = tokens.refresh_token;

        // Set credentials and persist to disk
        oAuth2Client.setCredentials(newTokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens, null, 2));
        return true;
      } catch (refreshErr) {
        // Refresh failed: caller should trigger re-auth flow
        console.error(
          "Token refresh failed:",
          refreshErr.message || refreshErr
        );
        return false;
      }
    }

    // No refresh token available -> need full re-authentication
    return false;
  } catch (err) {
    // Token file not found or invalid
    return false;
  }
};

// Add calendar event function
export const addCalendarEvent = async (req, res) => {
  try {
    // Check if token is valid first
    const valid = await isTokenValid();
    if (!valid) {
      return res.status(401).json({
        error: "Not authenticated. Please log in with Google first.",
      });
    }

    const { summary, description, start, end, location } = req.body;

    // Validate required fields
    if (!summary || !start || !end) {
      return res.status(400).json({
        error: "Missing required fields: summary, start, and end are required.",
      });
    }

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Create the event
    const event = {
      summary,
      description,
      location,
      start,
      end,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 10 }, // 10 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    console.log("Event created successfully:", response.data);
    res.json({
      success: true,
      event: response.data,
      message: "Event created successfully!",
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({
      error: "Failed to create calendar event",
      details: error.message,
    });
  }
};
