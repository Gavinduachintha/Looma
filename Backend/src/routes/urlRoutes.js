import express from "express";
import { healthCheck,summary } from "../urlControllers.js";
import { auth, oauth2callback } from "../services/auth.js";

const router = express.Router();

router.get("/", healthCheck);
// router.get("/getMails", getMails);
router.get("/summary",summary)
router.get("/auth", auth);
router.get("/oauth2callback", oauth2callback);
export default router;
