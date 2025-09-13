// Utility to check Google token validity from backend
// Usage: fetch('/api/google-token-valid')
import axios from "axios";

// Checks backend endpoint that reports whether stored Google OAuth token is still valid.
// Returns boolean.
export const checkGoogleTokenValid = async () => {
  try {
    const res = await axios.get("http://localhost:3000/google-token-valid", {
      withCredentials: true,
    });
    return !!res.data.valid;
  } catch (error) {
    console.error("Error checking Google token validity:", error);
    return false;
  }
};
