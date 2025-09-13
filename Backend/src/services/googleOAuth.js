import { google } from "googleapis";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { oAuth2Client } from "./auth.js";
import dotenv from "dotenv";

dotenv.config();

const jwtKey = process.env.JWT_KEY;

/**
 * Handle Google OAuth sign-in/sign-up
 * @param {string} code - OAuth code from Google
 * @returns {Object} User data and JWT token
 */
export const googleOAuthHandler = async (code) => {
  try {
    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userInfoResponse = await oauth2.userinfo.get();
    const googleUser = userInfoResponse.data;

    if (!googleUser.email) {
      throw new Error("No email found in Google account");
    }

    // Check if user exists with Google ID
    let userQuery = await db.query("SELECT * FROM users WHERE google_id = $1", [
      googleUser.id,
    ]);

    let user;

    if (userQuery.rows.length > 0) {
      // User exists with Google ID - sign in
      user = userQuery.rows[0];

      // Update user info in case it changed
      await db.query(
        "UPDATE users SET name = $1, avatar_url = $2, updated_at = CURRENT_TIMESTAMP WHERE google_id = $3",
        [googleUser.name, googleUser.picture, googleUser.id]
      );
    } else {
      // Check if user exists with same email (local account)
      const emailQuery = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [googleUser.email]
      );

      if (emailQuery.rows.length > 0) {
        // User exists with email but no Google ID - link accounts
        user = emailQuery.rows[0];
        await db.query(
          "UPDATE users SET google_id = $1, provider = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4",
          [googleUser.id, "google", googleUser.picture, googleUser.email]
        );
      } else {
        // Create new user
        const newUserQuery = await db.query(
          "INSERT INTO users (name, email, google_id, provider, avatar_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
          [
            googleUser.name || "Google User",
            googleUser.email,
            googleUser.id,
            "google",
            googleUser.picture,
          ]
        );
        user = newUserQuery.rows[0];
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        provider: user.provider || "google",
      },
      jwtKey,
      { expiresIn: "24h" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider || "google",
        avatar_url: user.avatar_url,
        googleTokenExpired: false, // Since we just got fresh tokens
      },
      tokens, // Google OAuth tokens for Gmail/Calendar access
      isNewUser: userQuery.rows.length === 0 && emailQuery.rows.length === 0,
    };
  } catch (error) {
    console.error("Google OAuth error:", error);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};

/**
 * Get user profile from Google
 * @param {Object} tokens - Google OAuth tokens
 * @returns {Object} Google user profile
 */
export const getGoogleUserProfile = async (tokens) => {
  try {
    oAuth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const response = await oauth2.userinfo.get();
    return response.data;
  } catch (error) {
    console.error("Error fetching Google user profile:", error);
    throw error;
  }
};

/**
 * Refresh Google tokens if needed
 * @param {string} userId - User ID
 * @returns {Object} Refreshed tokens or null
 */
export const refreshGoogleTokens = async (userId) => {
  try {
    // This would require storing refresh tokens in the database
    // For now, we'll return null and handle re-authentication
    return null;
  } catch (error) {
    console.error("Error refreshing Google tokens:", error);
    return null;
  }
};

export default {
  googleOAuthHandler,
  getGoogleUserProfile,
  refreshGoogleTokens,
};
