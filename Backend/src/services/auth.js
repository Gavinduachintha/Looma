import path from "path";
import fs from "fs";
import { google } from "googleapis";
const CREDENTIALS_PATH = path.join("../credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "../token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

// Load credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_secret, client_id, redirect_uris } = credentials.web;
export const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/oauth2callback"
);

// Auth route controller
export const auth = (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

// OAuth2 callback controller
export const oauth2callback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing code parameter");
  }
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send("Authentication successful! You can now use the app.");
  } catch (err) {
    res.status(500).send("Error retrieving access token: " + err.message);
  }
};
