import express from "express";
import {
  healthCheck,
  summary,
  fetchEmails,
  isRead,
  addEvent,
  getUpcomingEvents,
  fetchTrashedEmails,
  moveToTrash,
  restoreEmail,
  permanentlyDeleteEmail,
  emptyTrash,
  getDashboardStats,
  getEmailAnalytics,
  getEmailTrends,
  generateEmail,
  sendEmail,
} from "../controllers/urlControllers.js";
import {
  auth,
  oauth2callback,
  isTokenValid,
  oAuth2Client,
} from "../services/auth.js";
import {
  signIn,
  signUP,
  authenticate,
} from "../services/userAuthentication.js";

const router = express.Router();

router.get("/", healthCheck);
// router.get("/getMails", getMails);
router.get("/summary", authenticate, summary);
router.get("/fetchEmails", authenticate, fetchEmails);
router.post("/isRead", isRead);
router.post("/addEvent", addEvent);
router.get("/upcomingEvents", getUpcomingEvents);

// Trash email routes
router.get("/fetchTrashedEmails", authenticate, fetchTrashedEmails);
router.post("/moveToTrash", authenticate, moveToTrash);
router.post("/restoreEmail", authenticate, restoreEmail);
router.post("/permanentlyDeleteEmail", authenticate, permanentlyDeleteEmail);
router.post("/emptyTrash", authenticate, emptyTrash);

// Analytics routes
router.get("/dashboard-stats", authenticate, getDashboardStats);
router.get("/email-analytics", authenticate, getEmailAnalytics);
router.get("/email-trends", authenticate, getEmailTrends);

// AI and Email routes
router.post("/generateEmail", authenticate, generateEmail);
router.post("/sendEmail", authenticate, sendEmail);

// Test auth endpoint
router.get("/test-auth", authenticate, (req, res) => {
  res.json({ message: "Auth working", user: req.user });
});

// Google OAuth routes
router.get("/auth", auth); // Gmail/Calendar access
router.get("/auth/google", (req, res) => {
  // Google user authentication (sign-in/sign-up)
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state: "user_auth=true", // Flag to identify this as user auth
  });
  res.redirect(authUrl);
});

// Endpoint to check if Google token is valid
router.get("/google-token-valid", async (req, res) => {
  try {
    const valid = await isTokenValid();
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// User authentication routes
router.post("/signIn", signIn);
router.post("/signUp", signUP);

// OAuth callback - handles both Gmail access and user authentication
router.get("/oauth2callback", oauth2callback);

export default router;
