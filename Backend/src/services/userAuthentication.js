import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const jwtKey = process.env.JWT_KEY;

const isGoogleTokenExpired = () => {
  const tokenPath = path.join(process.cwd(), "../token.json");
  const tokenData = fs.readFileSync(tokenPath, "utf-8");
  const tokenJson = JSON.parse(tokenData);
  const expiery = tokenJson.expiry_date;
  return Date.now() > expiery;
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Access denied: missing token" });
  }
  if (!jwtKey) {
    console.warn("JWT_KEY not set in environment. Using undefined secret.");
  }
  jwt.verify(token, jwtKey, (err, user) => {
    if (err) {
      const expired = err.name === "TokenExpiredError";
      console.warn("JWT verify failed", {
        name: err.name,
        message: err.message,
      });
      return res.status(expired ? 401 : 403).json({
        error: expired ? "Token expired" : "Invalid token",
        code: expired ? "token_expired" : "invalid_token",
        details: err.message,
      });
    }
    req.user = user;
    next();
  });
};

// Debug helper (DO NOT enable in production permanently)
export const debugAuth = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(400).json({ error: "No token provided" });
  try {
    const decoded = jwt.decode(token, { complete: true });
    return res.json({ validSignature: !!decoded, decoded, now: Date.now() });
  } catch (e) {
    return res.status(400).json({ error: "Decode failed", details: e.message });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(401).json({ error: "All fields required" });
    }
    const isRegister = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (isRegister.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "User not registered. Please sign up first." });
    }
    const user = isRegister.rows[0];
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, jwtKey, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: "Login successful",
      token,
      user: { email: user.email, id: user.id, name: user.name },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const signUP = async (req, res) => {
  const saltRounds = 10;
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(401).json({ error: "All fields required" });
    }
    const isRegistered = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (isRegistered.rows.length > 0) {
      return res
        .status(401)
        .json({ error: "User already registered. Please sign in." });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const response = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    return res.status(201).json({
      success: "User created successfully",
      user: {
        name: response.rows[0].name,
        email: response.rows[0].email,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
