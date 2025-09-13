import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";
import { GoogleIcon, GmailIcon, CalendarIcon } from "../components/AuthIcons";
import {
  initiateGoogleAuth,
  handleOAuthCallback,
  checkGoogleTokenValid,
} from "../utils/googleAuth";
import { getTheme, getButtonStyles } from "../styles/colors";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const callbackResult = handleOAuthCallback(searchParams);
    if (callbackResult) {
      handleAuthCallback(callbackResult);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const isValid = await checkGoogleTokenValid();
      if (isValid) {
        setIsAuthenticated(true);
        toast.success("Already authenticated!");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleAuthCallback = (result) => {
    switch (result.status) {
      case "success":
        setIsAuthenticated(true);
        toast.success(result.message);
        setTimeout(() => navigate("/dashboard"), 1500);
        break;
      case "error":
        toast.error(result.message);
        setIsLoading(false);
        break;
      case "already":
        setIsAuthenticated(true);
        toast.info(result.message);
        setTimeout(() => navigate("/dashboard"), 1500);
        break;
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const result = await initiateGoogleAuth();

      if (result.alreadyAuthenticated) {
        setIsAuthenticated(true);
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      toast.error("Failed to connect");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex relative transition-colors duration-300"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #1a1a1a 100%)"
          : "linear-gradient(to bottom right, #f0fdf4, #ffffff, #f0fdf4)",
        color: theme.text.primary,
      }}
    >
      {/* Background Effects */}
      {isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(62,207,142,0.1),transparent_50%)]"></div>
          <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full blur-3xl bg-emerald-400/10"></div>
          <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full blur-3xl bg-teal-400/10"></div>
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-emerald-400/10"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-center w-full p-4 relative z-10">
        <motion.div
          className="w-full max-w-md p-8 rounded-2xl backdrop-blur-md transition-all duration-300"
          style={{
            background: isDarkMode
              ? theme.background.surface
              : "rgba(255, 255, 255, 0.9)",
            border: `1px solid ${theme.border.primary}`,
            boxShadow: isDarkMode
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GoogleIcon size={48} className="mx-auto mb-4" />
              <h1
                className="text-3xl font-bold mb-2 transition-colors duration-300"
                style={{ color: theme.text.primary }}
              >
                Connect Google Account
              </h1>
              <p
                className="text-sm transition-colors duration-300"
                style={{ color: theme.text.secondary }}
              >
                Access Gmail and Calendar features
              </p>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-300"
              style={{
                ":hover": {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(62, 207, 142, 0.05)",
                },
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(62, 207, 142, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <GmailIcon size={24} />
              <div>
                <h3
                  className="font-medium transition-colors duration-300"
                  style={{ color: theme.text.primary }}
                >
                  Gmail Integration
                </h3>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: theme.text.secondary }}
                >
                  Read and manage emails
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-300"
              style={{
                ":hover": {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(62, 207, 142, 0.05)",
                },
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(62, 207, 142, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <CalendarIcon size={24} />
              <div>
                <h3
                  className="font-medium transition-colors duration-300"
                  style={{ color: theme.text.primary }}
                >
                  Calendar Access
                </h3>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: theme.text.secondary }}
                >
                  View and create events
                </p>
              </div>
            </div>
          </motion.div>

          {/* Auth Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                className="w-full py-3"
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                }}
                disabled
              >
                ✓ Connected Successfully
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleConnect}
                loading={isLoading}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? "#3ecf8e" : "white",
                  color: isDarkMode ? "#0a0a0a" : "#1f2937",
                  border: isDarkMode
                    ? "none"
                    : `1px solid ${theme.border.primary}`,
                  transform: !isLoading ? "scale(1)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = isDarkMode
                      ? "#2dd4bf"
                      : "#f9fafb";
                    e.target.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = isDarkMode
                      ? "#3ecf8e"
                      : "white";
                    e.target.style.transform = "scale(1)";
                  }
                }}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <GoogleIcon size={20} />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            )}
          </motion.div>

          {/* Security Note */}
          <motion.p
            className="text-xs text-center mt-6 transition-colors duration-300"
            style={{ color: theme.text.tertiary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🔒 Secure OAuth 2.0 authentication
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
