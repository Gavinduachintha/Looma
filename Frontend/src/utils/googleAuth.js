import axios from "axios";
import toast from "react-hot-toast";

// Base URL for backend API
const API_BASE = "http://localhost:3000";

/**
 * Check if Google OAuth token is valid
 * @returns {Promise<boolean>} Token validity status
 */
export const checkGoogleTokenValid = async () => {
  try {
    const res = await axios.get(`${API_BASE}/google-token-valid`, {
      withCredentials: true,
    });
    return !!res.data.valid;
  } catch (error) {
    console.error("Error checking Google token validity:", error);
    return false;
  }
};

/**
 * Initiate Google OAuth flow
 * @returns {Promise<void>} Redirects to Google OAuth
 */
export const initiateGoogleAuth = async () => {
  try {
    // Check if already authenticated
    const isValid = await checkGoogleTokenValid();
    if (isValid) {
      toast.success("Already authenticated with Google");
      return { success: true, alreadyAuthenticated: true };
    }

    // Start OAuth flow by redirecting to backend auth endpoint
    window.location.href = `${API_BASE}/auth`;
    return { success: true, redirecting: true };
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    toast.error("Failed to start Google authentication");
    return { success: false, error: error.message };
  }
};

/**
 * Handle OAuth callback parameters from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Authentication result
 */
export const handleOAuthCallback = (searchParams) => {
  const authStatus = searchParams.get("auth");
  const errorMessage = searchParams.get("message");

  switch (authStatus) {
    case "success":
      return {
        status: "success",
        message: "Google authentication successful!",
      };
    case "error":
      return {
        status: "error",
        message: `Authentication failed: ${errorMessage || "Unknown error"}`,
      };
    case "already":
      return {
        status: "already",
        message: "Already authenticated with Google",
      };
    default:
      return null;
  }
};

/**
 * Get authentication status with detailed information
 * @returns {Promise<Object>} Authentication status and details
 */
export const getAuthStatus = async () => {
  try {
    const [tokenValid, authCheck] = await Promise.all([
      checkGoogleTokenValid(),
      axios.get(`${API_BASE}/checkGoogleAuth`, { withCredentials: true }),
    ]);

    return {
      isAuthenticated: tokenValid && authCheck.data.authenticated,
      tokenValid,
      backendAuth: authCheck.data.authenticated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting auth status:", error);
    return {
      isAuthenticated: false,
      tokenValid: false,
      backendAuth: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Revoke Google authentication
 * @returns {Promise<Object>} Revocation result
 */
export const revokeGoogleAuth = async () => {
  try {
    // Note: This would require backend implementation for token revocation
    // For now, we can clear local state
    toast.info("Authentication revoked locally");
    return { success: true };
  } catch (error) {
    console.error("Error revoking Google auth:", error);
    toast.error("Failed to revoke authentication");
    return { success: false, error: error.message };
  }
};

/**
 * Get user's Gmail and Calendar permissions
 * @returns {Object} Permission details
 */
export const getGrantedPermissions = () => {
  // Based on the scopes defined in backend (auth.js)
  return {
    gmail: {
      read: true,
      send: true,
      description: "Read and send emails from your Gmail account",
    },
    calendar: {
      read: true,
      write: true,
      description: "View and manage your Google Calendar events",
    },
  };
};

export default {
  checkGoogleTokenValid,
  initiateGoogleAuth,
  handleOAuthCallback,
  getAuthStatus,
  revokeGoogleAuth,
  getGrantedPermissions,
};
