import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import { useTheme } from "../context/ThemeContext";

const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  // Handle OAuth callback from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      toast.error(`Authentication failed: ${decodeURIComponent(error)}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/signIn", {
        email: email,
        password: password,
      });
      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id); // Store userId
      localStorage.setItem("googleTokenExpired", user.googleTokenExpired);
      localStorage.setItem("userData", JSON.stringify(user));
      console.log("Success", res.data);

      navigate("/dashboard");
      toast.success("Welcome back!");
    } catch (error) {
      // Improved diagnostic logging for easier debugging of Network Error
      if (error.response) {
        console.log(
          "Login error response:",
          error.response.status,
          error.response.data
        );
        toast.error(
          error.response.data?.error ||
            (error.response.status === 401
              ? "Invalid credentials"
              : "Login failed")
        );
      } else if (error.request) {
        console.log("No response received from server", error.request);
        toast.error("No response from server. Is backend running on :3000?");
      } else {
        console.log("Request setup error:", error.message);
        toast.error("Request error: " + error.message);
      }
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const handleSocialLogin = (provider) => {
    if (provider === "Google") {
      // Redirect to backend Google auth for user authentication
      window.location.href = "http://localhost:3000/auth/google";
    } else {
      toast.info(`${provider} login coming soon!`);
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex relative transition-colors duration-300`}
      style={{
        background: isDarkMode ? "#0a0a0a" : "#ffffff",
      }}
    >
      <Toaster />
      {/* Theme Toggle - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <motion.button
          onClick={toggleTheme}
          className="p-3 rounded-xl transition-all duration-300 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </motion.button>
      </div>
      {/* Left Side - Feature Showcase */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-colors duration-300 ${
          isDarkMode ? "bg-neutral-950" : "bg-emerald-600"
        }`}
      >
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isDarkMode
              ? "bg-[radial-gradient(circle_at_30%_40%,rgba(62,207,142,0.1),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_30%_40%,rgba(62,207,142,0.08),transparent_50%)]"
          }`}
        ></div>

        <div className="relative z-10 flex flex-col justify-center items-center px-12 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-12">
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
                  backdropFilter: "blur(10px)",
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span
                  className="cursor-pointer font-bold text-2xl text-white"
                  onClick={() => navigate("/")}
                >
                  L
                </span>
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Looma</h1>
            </div>

            <h2 className="text-5xl font-bold mb-6 text-white leading-tight">
              Start building with
              <br />
              Looma
            </h2>
          </motion.div>

          {/* Feature Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span className="text-white/80">
                AI-powered email intelligence
              </span>
            </div> */}
            {/* <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span className="text-white/80">
                Advanced analytics and insights
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span className="text-white/80">
                Secure and private processing
              </span>
            </div> */}
          </motion.div>

          {/* Footer */}
          <div className="absolute bottom-6 left-12 text-white/40 text-sm">
            © 2025 Looma, Inc. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          className={`w-full max-w-md p-8 rounded-3xl backdrop-blur-sm border transition-colors duration-300 ${
            isDarkMode
              ? "bg-neutral-950/95 border-neutral-800/50"
              : "bg-white/90 border-gray-200/50 shadow-2xl"
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Sign in
            </h2>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-neutral-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full rounded-lg px-4 py-3 border focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                  isDarkMode
                    ? "bg-neutral-900 text-white border-neutral-700 focus:ring-green-500/50 placeholder-neutral-500"
                    : "bg-white text-gray-700 border-gray-300 focus:ring-green-500/50 placeholder-gray-400"
                }`}
                placeholder="Email"
                autoComplete="email"
                whileFocus={{ scale: 1.02 }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-neutral-300" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <motion.input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full rounded-lg px-4 py-3 border focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                  isDarkMode
                    ? "bg-neutral-900 text-white border-neutral-700 focus:ring-green-500/50 placeholder-neutral-500"
                    : "bg-white text-gray-700 border-gray-300 focus:ring-green-500/50 placeholder-gray-400"
                }`}
                placeholder="Password"
                autoComplete="current-password"
                whileFocus={{ scale: 1.02 }}
              />
            </div>

            <div className="text-center mb-6">
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-neutral-400" : "text-gray-600"
                }`}
              >
                By continuing, you agree to the{" "}
                <a href="#" className="text-green-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-500 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>

            <motion.button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                isDarkMode
                  ? "bg-white text-black active:bg-green-600 focus:ring-green-500/50 shadow-lg hover:shadow-green-400/25"
                  : "bg-black text-white active:bg-green-700 focus:ring-black shadow-lg hover:shadow-black-500/25"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${
                    isDarkMode ? "border-neutral-700" : "border-gray-200"
                  }`}
                ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-2 transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-neutral-950 text-neutral-400"
                      : "bg-white text-gray-600"
                  }`}
                >
                  OR
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* <motion.button
                type="button"
                onClick={() => handleSocialLogin("GitHub")}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode
                    ? "border-white/10 text-white hover:bg-white/5 focus:ring-white/20"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300"
                } focus:outline-none focus:ring-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </motion.button> */}

              <motion.button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode
                    ? "border-neutral-700 text-white hover:bg-neutral-800 focus:ring-neutral-600"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300"
                } focus:outline-none focus:ring-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </motion.button>

              {/* <motion.button
                type="button"
                onClick={() => handleSocialLogin("Microsoft")}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode
                    ? "border-white/10 text-white hover:bg-white/5 focus:ring-white/20"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300"
                } focus:outline-none focus:ring-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#00A4EF" d="M13 1h10v10H13z" />
                  <path fill="#7FBA00" d="M1 13h10v10H1z" />
                  <path fill="#FFB900" d="M13 13h10v10H13z" />
                </svg>
                Continue with Microsoft
              </motion.button> */}
            </div>
          </motion.form>

          <div className="text-center mt-8">
            <p
              className={`text-sm transition-colors duration-300 ${
                isDarkMode ? "text-neutral-400" : "text-gray-600"
              }`}
            >
              Don't have an account?{" "}
              <button
                onClick={goToSignup}
                className={`font-medium transition-colors underline-offset-2 hover:underline ${
                  isDarkMode
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-500"
                }`}
              >
                Sign up for free
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Loginpage;
