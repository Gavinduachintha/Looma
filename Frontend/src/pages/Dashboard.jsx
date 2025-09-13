import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkGoogleTokenValid } from "../utils/checkGoogleTokenValid";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Sun,
  Moon,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  CalendarCheck2,
  SquareArrowOutUpRight,
} from "lucide-react";

// Components
import SkeletonCard from "../components/SkeletonCard";
import EmailCard from "../components/EmailCard";
import DateWidget from "../components/DateWidget";
import EmailAnalytics from "../components/EmailAnalytics";
import Settings from "../components/Settings";
import Button from "../components/ui/Button";

// Context
import { useTheme } from "../context/ThemeContext";
import { useCount } from "../context/CountContext";

// Custom hook for current date
function useCurrentDate(refreshInterval = 60000) {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);
  return date;
}

const Dashboard = () => {
  const currentDate = useCurrentDate();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [emails, setEmails] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Pagination & search removed for dashboard (handled in Emails page)
  const [settings, setSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmails: 0,
    unreadEmails: 0,
    readRate: 0,
    todayEmails: 0,
    weekEmails: 0,
    trashedEmails: 0,
    starredEmails: 0,
    attachmentEmails: 0,
    dailyAverage: 0,
  });
  // Add filter states after other state declarations
  const [emailFilter, setEmailFilter] = useState("all"); // 'all', 'unread', 'starred', 'today'
  const [emailSort, setEmailSort] = useState("newest"); // 'newest', 'oldest', 'unread-first'
  // Add search state
  const [emailSearch, setEmailSearch] = useState("");
  // Add pagination state for emails
  const [pageSize] = useState(10); // Default page size for pagination
  // Add bulk action states
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { refreshCounts } = useCount();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const errorMessage = searchParams.get("message");
    const token = searchParams.get("token");
    const userDataString = searchParams.get("user");
    const isNewUser = searchParams.get("new_user") === "true";

    if (authStatus === "success") {
      if (token && userDataString) {
        // Handle Google OAuth user authentication
        try {
          const userData = JSON.parse(decodeURIComponent(userDataString));

          // Store authentication data
          localStorage.setItem("authToken", decodeURIComponent(token));
          localStorage.setItem("userId", userData.id);
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem(
            "googleTokenExpired",
            userData.googleTokenExpired || false
          );

          if (isNewUser) {
            toast.success(
              "Welcome to Looma! Your account has been created successfully."
            );
          } else {
            toast.success("Welcome back! You've been signed in with Google.");
          }

          setIsGoogleAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          toast.error(
            "Authentication data error. Please try signing in again."
          );
        }
      } else {
        // Handle Gmail/Calendar authentication only
        // toast.success("Google services connected successfully!");
        setIsGoogleAuthenticated(true);
        
      }

      // Clear the URL parameters
      navigate("/dashboard", { replace: true });
    } else if (authStatus === "error") {
      toast.error(
        `Google authentication failed: ${errorMessage || "Unknown error"}`
      );
      navigate("/dashboard", { replace: true });
    } else if (authStatus === "already") {
      toast.info("Already authenticated with Google");
      setIsGoogleAuthenticated(true);
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, navigate]);

  function useCurrentDate(refreshInterval = 60000) {
    const [date, setDate] = useState(new Date());
    useEffect(() => {
      const timer = setInterval(() => setDate(new Date()), refreshInterval);
      return () => clearInterval(timer);
    }, [refreshInterval]);
    return date;
  }

  const fetchEmails = async (isLoadingRequest = true) => {
    if (isLoadingRequest) {
      setIsRefreshing(true);
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/fetchEmails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmails(res.data || []);
      // Refresh counts when emails are fetched in dashboard
      refreshCounts();
    } catch (error) {
      console.error("Error fetching emails:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/signin");
      }
      toast.error("Failed to fetch emails");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "Fetching dashboard stats with token:",
        token ? "Token exists" : "No token"
      );

      // Test auth first
      try {
        const testRes = await axios.get("http://localhost:3000/test-auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Auth test successful:", testRes.data);
      } catch (authError) {
        console.error("Auth test failed:", authError.response?.data);
      }

      const res = await axios.get("http://localhost:3000/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Dashboard stats response:", res.data);
      setDashboardStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/signin");
      } else {
        // Set default stats to prevent UI from showing undefined values
        setDashboardStats({
          totalEmails: 0,
          unreadEmails: 0,
          readRate: 0,
          todayEmails: 0,
          weekEmails: 0,
          trashedEmails: 0,
          starredEmails: 0,
          attachmentEmails: 0,
          dailyAverage: 0,
        });
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/email-analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnalyticsData(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const checkGoogleAuthenticationStatus = async () => {
    try {
      const isValid = await checkGoogleTokenValid();
      setIsGoogleAuthenticated(isValid);
      // If valid, fetch events now (previously this ran unconditionally on mount causing 401s before auth)
      if (isValid) {
        fetchUpcomingEvents();
      }
    } catch (error) {
      console.error("Error checking Google authentication:", error);
      setIsGoogleAuthenticated(false);
    }
  };

  // Separate function so we can trigger it only after auth is confirmed
  const fetchUpcomingEvents = async () => {
    if (!isGoogleAuthenticated) return; // guard
    try {
      const res = await axios.get("http://localhost:3000/upcomingEvents", {
        withCredentials: true,
      });
      setUpcomingEvents(res.data.events || []);
    } catch (e) {
      // 401 here usually means you haven't connected Google yet
      if (e?.response?.status === 401) {
        console.info(
          "Skipped upcoming events: Google not authenticated (401). Connect Google to enable."
        );
      } else {
        console.warn("Failed to load upcoming events", e?.message || e);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsRefreshing(true);
      // Re-check validity before forcing auth
      const stillValid = await checkGoogleTokenValid();
      if (stillValid) {
        toast.success("Google already connected");
        setIsGoogleAuthenticated(true);
        return;
      }
      // Kick off backend-driven OAuth flow so refresh tokens are handled server side
      window.location.href = "http://localhost:3000/auth";
    } catch (error) {
      toast.error("Failed to start Google auth");
    } finally {
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (emailId, read) => {
    try {
      await axios.post("http://localhost:3000/isRead", { emailId, read });
      fetchEmails(false);
      // Refresh counts when email read status changes in dashboard
      refreshCounts();
    } catch (error) {
      console.error("Error marking as read: ", error);
    }
  };

  const deleteEmail = async (emailId) => {
    const prev = emails;
    setEmails((list) => list.filter((e) => e.email_id !== emailId));
    try {
      await axios.post("http://localhost:3000/deleteEmail", { emailId });
      toast.success("Email deleted");
    } catch (error) {
      console.error("Error deleting email: ", error);
      setEmails(prev);
      toast.error("Error deleting the email");
    }
  };

  // Bulk action functions
  const handleBulkMarkAsRead = async () => {
    try {
      for (const emailId of selectedEmails) {
        await markAsRead(emailId, true);
      }
      setSelectedEmails([]);
      setBulkActionMode(false);
      toast.success(`${selectedEmails.length} emails marked as read`);
    } catch (error) {
      toast.error("Error marking emails as read");
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const emailId of selectedEmails) {
        await deleteEmail(emailId);
      }
      setSelectedEmails([]);
      setBulkActionMode(false);
      toast.success(`${selectedEmails.length} emails deleted`);
    } catch (error) {
      toast.error("Error deleting emails");
    }
  };

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  const selectAllVisibleEmails = () => {
    const visibleEmailIds = latestEmails.map((email) => email.email_id);
    setSelectedEmails(visibleEmailIds);
  };

  const clearSelection = () => {
    setSelectedEmails([]);
    setBulkActionMode(false);
  };

  useEffect(() => {
    fetchEmails();
    fetchDashboardStats();
    checkGoogleAuthenticationStatus(); // will internally fetch events once auth confirmed
  }, []);

  // In case auth status flips from false -> true later (e.g., after completing OAuth flow), fetch events
  useEffect(() => {
    if (isGoogleAuthenticated) {
      fetchUpcomingEvents();
    }
  }, [isGoogleAuthenticated]);

  // Fetch analytics when showAnalytics is toggled on
  useEffect(() => {
    if (showAnalytics && !analyticsData) {
      fetchAnalytics();
    }
  }, [showAnalytics]);

  const handleRefresh = () => {
    fetchEmails();
    fetchDashboardStats();
    if (showAnalytics) {
      fetchAnalytics();
    }
  };

  // Enhanced sorting and filtering logic
  const filteredAndSortedEmails = useMemo(() => {
    let filtered = [...emails];

    // Apply search filter
    if (emailSearch) {
      filtered = filtered.filter(
        (email) =>
          email.subject?.toLowerCase().includes(emailSearch.toLowerCase()) ||
          email.from_email?.toLowerCase().includes(emailSearch.toLowerCase()) ||
          email.summary?.toLowerCase().includes(emailSearch.toLowerCase())
      );
    }

    // Apply filters
    switch (emailFilter) {
      case "unread":
        filtered = filtered.filter((email) => !email.read);
        break;
      case "priority":
        filtered = filtered.filter(
          (email) =>
            email.subject?.toLowerCase().includes("urgent") ||
            email.subject?.toLowerCase().includes("important") ||
            email.subject?.toLowerCase().includes("asap")
        );
        break;
      case "today":
        const today = new Date().toISOString().split("T")[0];
        filtered = filtered.filter((email) => {
          const emailDate = new Date(
            email.date || email.receivedAt || email.timestamp
          );
          return emailDate.toISOString().split("T")[0] === today;
        });
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    switch (emailSort) {
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a?.date || a?.receivedAt || a?.timestamp || 0).getTime() -
            new Date(b?.date || b?.receivedAt || b?.timestamp || 0).getTime()
        );
        break;
      case "unread-first":
        filtered.sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return (
            new Date(b?.date || b?.receivedAt || b?.timestamp || 0).getTime() -
            new Date(a?.date || a?.receivedAt || a?.timestamp || 0).getTime()
          );
        });
        break;
      default: // 'newest'
        filtered.sort(
          (a, b) =>
            new Date(b?.date || b?.receivedAt || b?.timestamp || 0).getTime() -
            new Date(a?.date || a?.receivedAt || a?.timestamp || 0).getTime()
        );
        break;
    }

    return filtered;
  }, [emails, emailFilter, emailSort, emailSearch]);

  const latestEmails = useMemo(
    () => filteredAndSortedEmails.slice(0, 6),
    [filteredAndSortedEmails]
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(emails.length / pageSize)),
    [emails]
  );

  return (
    <div
      className={`w-full min-h-screen transition-all duration-500`}
      style={{
        background: isDarkMode
          ? "#0a0a0a" // Supabase dark background
          : "#ffffff", // Supabase light background
      }}
    >
      <Toaster />

      <style>
        {`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${
              isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(62,207,142,0.5)"
            } transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${
              isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(62,207,142,0.5)"
            };
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${
              isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(62,207,142,0.7)"
            };
          }
        `}
      </style>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[radial-gradient(circle_at_30%_40%,rgba(62,207,142,0.1),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(62,207,142,0.05),transparent_50%)]"
          }`}
        ></div>
        <div
          className={`absolute top-1/4 -left-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-emerald-400/10" : "bg-emerald-400/8"
          }`}
        ></div>
        <div
          className={`absolute top-1/3 -right-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-teal-400/10" : "bg-teal-400/8"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-green-400/10" : "bg-green-400/8"
          }`}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Overview Content (tabs removed) */}
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-transparent mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 py-4 gap-4">
            {/* Left: Logo/App Name */}
            <div className="flex items-center gap-3 min-w-[120px]">
              {/* Replace with logo if available */}
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {currentDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Spacer to push actions right */}
            <div className="flex-1 hidden lg:block" />

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {!isGoogleAuthenticated && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoogleAuth}
                  icon={SquareArrowOutUpRight}
                  className="hover:bg-emerald-500/50 hover:text-white transition-colors duration-200"
                >
                  Connect Google
                </Button>
              )}
              <Button
                variant={showAnalytics ? "primary" : "outline"}
                size="lg"
                onClick={() => setShowAnalytics(!showAnalytics)}
                icon={BarChart3}
              >
                Analytics
              </Button>
              <Button
                variant="theme"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                icon={isDarkMode ? Sun : Moon}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleRefresh}
                loading={isRefreshing}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Total Emails Card */}
          <motion.div
            className={`rounded-2xl backdrop-blur-xl border p-6 cursor-pointer transition-all duration-300 ${
              isDarkMode
                ? "border-[#262626] hover:border-emerald-500/50"
                : "border-[#e5e7eb] shadow-sm hover:shadow-lg hover:border-emerald-500/50"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/emails")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDarkMode ? "bg-emerald-600" : "bg-emerald-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Emails
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {dashboardStats.totalEmails}
                  </p>
                </div>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  dashboardStats.totalEmails > 50
                    ? isDarkMode
                      ? "bg-red-900/30 text-red-400"
                      : "bg-red-100 text-red-600"
                    : isDarkMode
                    ? "bg-green-900/30 text-green-400"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {dashboardStats.totalEmails > 50 ? "High" : "Normal"}
              </div>
            </div>
          </motion.div>

          {/* Unread Emails Card */}
          <motion.div
            className={`rounded-2xl backdrop-blur-xl border p-6 cursor-pointer transition-all duration-300 ${
              isDarkMode
                ? "border-[#262626] hover:border-orange-500/50"
                : "border-[#e5e7eb] shadow-sm hover:shadow-lg hover:border-orange-500/50"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/emails?filter=unread")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDarkMode ? "bg-orange-600" : "bg-orange-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Unread
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {dashboardStats.unreadEmails}
                    </p>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      (
                      {dashboardStats.totalEmails > 0
                        ? Math.round(
                            (dashboardStats.unreadEmails /
                              dashboardStats.totalEmails) *
                              100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Read Rate Card */}
          <motion.div
            className={`rounded-2xl backdrop-blur-xl border p-6 ${
              isDarkMode ? "border-[#262626]" : "border-[#e5e7eb] shadow-sm"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-blue-600" : "bg-blue-500"
                }`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Read Rate
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.readRate}%
                </p>
              </div>
            </div>
          </motion.div>

          {/* Today's Activity Card */}
          <motion.div
            className={`rounded-2xl backdrop-blur-xl border p-6 ${
              isDarkMode ? "border-[#262626]" : "border-[#e5e7eb] shadow-sm"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-purple-600" : "bg-purple-500"
                }`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Today's Emails
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.todayEmails}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats Row */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Trash Count */}
          <motion.div
            className={`rounded-xl backdrop-blur-xl border p-4 ${
              isDarkMode ? "border-[#262626]" : "border-[#e5e7eb] shadow-sm"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-red-600/20" : "bg-red-100"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Trashed
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.trashedEmails}
                </p>
              </div>
            </div>
          </motion.div>

          {/* This Week's Emails */}
          <motion.div
            className={`rounded-xl backdrop-blur-xl border p-4 ${
              isDarkMode ? "border-[#262626]" : "border-[#e5e7eb] shadow-sm"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-indigo-600/20" : "bg-indigo-100"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  This Week
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.weekEmails}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Average Daily */}
          <motion.div
            className={`rounded-xl backdrop-blur-xl border p-4 ${
              isDarkMode ? "border-[#262626]" : "border-[#e5e7eb] shadow-sm"
            }`}
            style={{ background: isDarkMode ? "#171717" : "#ffffff" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-cyan-600/20" : "bg-cyan-100"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Daily Avg
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {dashboardStats.dailyAverage}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Events Card (full width) */}
        <motion.div
          className={`w-full rounded-2xl backdrop-blur-xl border p-4 overflow-hidden mb-8 ${
            isDarkMode
              ? "bg-white/5 border-white/20"
              : "bg-white/60 border-white/40 shadow-lg"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-2 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDarkMode ? "bg-green-600" : "bg-green-600"
                }`}
              >
                <CalendarCheck2 />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className={`text-xs font-medium tracking-wide ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Upcoming Events
                </span>
                <span
                  className={`text-lg font-semibold -mt-0.5 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {upcomingEvents.length}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/events")}
              className={`text-[11px] font-medium whitespace-nowrap ${
                isDarkMode ? "text-emerald-300" : "text-emerald-600"
              }`}
            >
              View all
            </Button>
          </div>
          <ul className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11.5px] leading-snug custom-scrollbar">
            {!isGoogleAuthenticated && (
              <li
                className={`text-[11px] italic $${
                  isDarkMode ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Connect Google to view events.
              </li>
            )}
            {isGoogleAuthenticated &&
              upcomingEvents.slice(0, 3).map((evt) => {
                const dt = evt.start ? new Date(evt.start) : null;
                return (
                  <li
                    key={evt.id}
                    className={`rounded-md px-2.5 py-1.5 border flex flex-col ${
                      isDarkMode
                        ? "bg-neutral-800/60 border-white/10 text-gray-200"
                        : "bg-white/80 border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="font-medium truncate">
                      {evt.summary || "(No title)"}
                    </span>
                    {dt && (
                      <span
                        className={`mt-0.5 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {dt.toLocaleDateString()} •{" "}
                        {dt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </li>
                );
              })}
            {isGoogleAuthenticated && upcomingEvents.length === 0 && (
              <li
                className={`text-[11px] italic ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                No events
              </li>
            )}
          </ul>
        </motion.div>

        {/* Email Analytics Section */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp
                className={`w-6 h-6 ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Email Analytics
              </h2>
            </div>
            <EmailAnalytics
              emails={emails}
              isDarkMode={isDarkMode}
              analyticsData={analyticsData}
            />
          </motion.div>
        )}

        {/* Latest Emails Grid */}
        <motion.div
          className={`rounded-xl backdrop-blur-xl border overflow-hidden ${
            isDarkMode
              ? "bg-white/5 border-white/20"
              : "bg-white/60 border-white/40 shadow-lg"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6">
            <div className="flex flex-col gap-4 mb-4">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Latest Emails
                  </h3>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {latestEmails.length} of {filteredAndSortedEmails.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.open("mailto:", "_blank")}
                    className="text-xs"
                  >
                    ✉️ Compose
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/emails")}
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  >
                    Open Inbox
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search emails by subject, sender, or content..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 text-sm rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600 text-gray-300 placeholder-gray-500 focus:border-emerald-500"
                      : "bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:border-emerald-500"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                />
                <svg
                  className={`absolute left-3 top-2.5 w-4 h-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {emailSearch && (
                  <button
                    onClick={() => setEmailSearch("")}
                    className={`absolute right-3 top-2.5 w-4 h-4 ${
                      isDarkMode
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Filter:
                  </span>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "unread", label: "Unread" },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setEmailFilter(filter.key)}
                        className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                          emailFilter === filter.key
                            ? isDarkMode
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-500 text-white"
                            : isDarkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span className="mr-1">{filter.icon}</span>
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Sort:
                  </span>
                  <select
                    value={emailSort}
                    onChange={(e) => setEmailSort(e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="unread-first">Unread First</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedEmails.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {selectedEmails.length} email
                      {selectedEmails.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllVisibleEmails}
                      className="text-xs"
                    >
                      Select All ({latestEmails.length})
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMarkAsRead}
                      className="text-xs"
                    >
                      📧 Mark Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-xs text-red-600"
                    >
                      🗑️ Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs"
                    >
                      ✕ Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
            {isRefreshing && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[600px]">
                {[...Array(12)].map((_, i) => (
                  <SkeletonCard key={i} isDarkMode={isDarkMode} compact />
                ))}
              </div>
            )}
            {!isRefreshing && latestEmails.length === 0 && (
              <div className="text-sm opacity-70 py-4">No emails yet.</div>
            )}
            {!isRefreshing && latestEmails.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestEmails.map((email) => (
                  <div key={email.email_id} className="relative group">
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity:
                            selectedEmails.includes(email.email_id) ||
                            bulkActionMode
                              ? 1
                              : 0,
                          scale:
                            selectedEmails.includes(email.email_id) ||
                            bulkActionMode
                              ? 1
                              : 0.8,
                        }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEmailSelection(email.email_id);
                          setBulkActionMode(true);
                        }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedEmails.includes(email.email_id)
                            ? "bg-emerald-500 border-emerald-500"
                            : isDarkMode
                            ? "border-gray-500 bg-gray-800 hover:border-gray-400"
                            : "border-gray-400 bg-white hover:border-gray-500"
                        }`}
                      >
                        {selectedEmails.includes(email.email_id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </motion.button>
                    </div>

                    {/* Email Status Indicators */}
                    <div className="absolute bottom-2 left-2 z-10 flex gap-1">
                      {/* {!email.read && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isDarkMode
                              ? "bg-orange-600 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          New
                        </span>
                      )} */}
                      {(email.subject?.toLowerCase().includes("urgent") ||
                        email.subject?.toLowerCase().includes("important") ||
                        email.subject?.toLowerCase().includes("asap")) && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isDarkMode
                              ? "bg-red-600 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          Priority
                        </span>
                      )}
                      {(() => {
                        const emailDate = new Date(
                          email.date || email.receivedAt || email.timestamp
                        );
                        const today = new Date();
                        const isToday =
                          emailDate.toDateString() === today.toDateString();
                      })()}
                    </div>

                    <EmailCard
                      email={email}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteEmail}
                      isDarkMode={isDarkMode}
                      compact
                      isSelected={selectedEmails.includes(email.email_id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      {settings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSettings(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              minWidth: 320,
              padding: 24,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSettings(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
              }}
              aria-label="Close settings"
            >
              ×
            </button>
            <Settings />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
