import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Settings = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("about");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    alert("Logged out successfully!");
    if (onClose) onClose();
  };

  const handleGoogleAuth = () => {
    // Redirect to the backend auth endpoint which will redirect to Google OAuth
    window.location.href = "http://localhost:3000/auth";
  };

  const sidebarItems = [
    { id: "about", label: "About Me", icon: "👤" },
    { id: "auth", label: "Auth Google", icon: "🔐" },
    { id: "logout", label: "Logout", icon: "🚪" },
  ];

  return (
    <div
      className={`flex h-[500px] w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xl ${
        isDarkMode ? "bg-neutral-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Responsive Sidebar */}
      <div
        className={`w-full sm:w-64 lg:w-72 flex flex-col ${
          isDarkMode
            ? "bg-neutral-800 border-neutral-700"
            : "bg-gray-50 border-gray-200"
        } border-r`}
      >
        {/* Header */}
        <div className="p-6 border-b border-current border-opacity-10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Settings
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.id === "logout") {
                      handleLogout();
                    } else if (item.id === "auth") {
                      handleGoogleAuth();
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? isDarkMode
                        ? "bg-orange-600/20 text-orange-300 border-l-4 border-orange-500"
                        : "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-neutral-700 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            isDarkMode
              ? "border-neutral-700 text-gray-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          <p className="text-xs text-center">Looma v1.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            } transition-all`}
          >
            ✕
          </button>
        )}

        {/* Content based on active section */}
        {activeSection === "about" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">About Looma</h3>
              <div
                className={`p-6 rounded-lg ${
                  isDarkMode ? "bg-neutral-800" : "bg-gray-50"
                }`}
              >
                <p className="text-lg mb-4">
                  Looma is an intelligent email management platform that helps
                  you organize, summarize, and interact with your Gmail
                  efficiently.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Smart email summarization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Gmail integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Dashboard analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Secure authentication</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <h4 className="font-semibold mb-2">Getting Started</h4>
              <p className="text-sm">
                To begin using Looma, authenticate with your Google account to
                sync your Gmail data securely.
              </p>
            </div>
          </div>
        )}

        {activeSection === "auth" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Google Authentication</h3>
              <div
                className={`p-6 rounded-lg ${
                  isDarkMode ? "bg-neutral-800" : "bg-gray-50"
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl">🔐</div>
                  <h4 className="text-xl font-semibold">Connect Your Gmail</h4>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Securely connect your Google account to start managing your
                    emails with Looma.
                  </p>

                  <button
                    onClick={handleGoogleAuth}
                    className={`inline-flex items-center gap-3 px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-lg ${
                      isDarkMode
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/25"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-500/25"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div
                    className={`mt-6 p-4 rounded-lg border ${
                      isDarkMode
                        ? "border-neutral-600 bg-neutral-700/50"
                        : "border-gray-200 bg-gray-100"
                    }`}
                  >
                    <p className="text-xs">
                      <strong>Privacy:</strong> Your email data is processed
                      securely and never stored permanently. We only access
                      what's necessary for summarization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
