import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import {
  RefreshCw,
  RotateCcw,
  Trash2,
  Search,
  Archive,
  AlertTriangle,
} from "lucide-react";
import Button from "../components/ui/Button";

const Trash = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [trashedEmails, setTrashedEmails] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState(null);
  const pageSize = 25;

  // Mock data for demonstration - replace with actual API calls
  const mockTrashedEmails = [
    {
      email_id: "trash1",
      subject: "Weekly Newsletter",
      from: "Newsletter Team <newsletter@company.com>",
      from_email: "newsletter@company.com",
      date: "2025-09-10T10:30:00Z",
      summary: "This week's updates on product releases and company news.",
      snippet:
        "Welcome to this week's newsletter featuring our latest product updates...",
      deleted_date: "2025-09-11T15:20:00Z",
      read: true,
    },
    {
      email_id: "trash2",
      subject: "Meeting Follow-up",
      from: "John Smith <john.smith@company.com>",
      from_email: "john.smith@company.com",
      date: "2025-09-09T14:15:00Z",
      summary: "Follow-up notes from today's team meeting and action items.",
      snippet:
        "Thanks for joining today's meeting. Here are the key points discussed...",
      deleted_date: "2025-09-11T12:10:00Z",
      read: false,
    },
    {
      email_id: "trash3",
      subject: "Project Update Required",
      from: "Sarah Johnson <sarah.j@company.com>",
      from_email: "sarah.j@company.com",
      date: "2025-09-08T09:45:00Z",
      summary: "Request for status update on the Q3 project deliverables.",
      snippet:
        "Hi team, we need to review the current status of our Q3 projects...",
      deleted_date: "2025-09-11T08:30:00Z",
      read: true,
    },
    {
      email_id: "trash4",
      subject: "Security Alert",
      from: "Security Team <security@company.com>",
      from_email: "security@company.com",
      date: "2025-09-07T16:20:00Z",
      summary: "Important security update regarding recent system changes.",
      snippet:
        "This is an important security notification about recent changes...",
      deleted_date: "2025-09-10T20:15:00Z",
      read: false,
    },
    {
      email_id: "trash5",
      subject: "Invoice #INV-2025-0892",
      from: "Billing Department <billing@vendor.com>",
      from_email: "billing@vendor.com",
      date: "2025-09-06T11:00:00Z",
      summary: "Monthly invoice for services rendered in August 2025.",
      snippet: "Please find attached your invoice for the services provided...",
      deleted_date: "2025-09-10T14:45:00Z",
      read: true,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) navigate("/signin");
    fetchTrashedEmails();
  }, []); // eslint-disable-line

  const fetchTrashedEmails = async (showLoader = true) => {
    if (showLoader) setIsRefreshing(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/fetchTrashedEmails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data || [];
      setTrashedEmails(list);
      if (!selectedId && list.length) setSelectedId(list[0].email_id);
    } catch (e) {
      console.error(e);
      setFetchError("Failed to fetch trashed emails. Please try again later.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const restoreEmail = async (emailId) => {
    const backup = trashedEmails;
    setTrashedEmails((prev) => prev.filter((e) => e.email_id !== emailId));
    if (selectedId === emailId) setSelectedId(null);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/restoreEmail",
        { emailId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Email restored successfully");
      // You can add a toast notification here if you have a toast library
    } catch (e) {
      console.error(e);
      // Restore the backup on error
      setTrashedEmails(backup);
    }
  };

  const permanentlyDeleteEmail = async (emailId) => {
    const backup = trashedEmails;
    setTrashedEmails((prev) => prev.filter((e) => e.email_id !== emailId));
    if (selectedId === emailId) setSelectedId(null);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/permanentlyDeleteEmail",
        { emailId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Email permanently deleted");
      // You can add a toast notification here if you have a toast library
    } catch (e) {
      console.error(e);
      // Restore the backup on error
      setTrashedEmails(backup);
    }
  };

  const emptyTrash = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all emails in trash? This action cannot be undone."
    );
    if (!confirmed) return;

    const backup = trashedEmails;
    setTrashedEmails([]);
    setSelectedId(null);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/emptyTrash",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Trash emptied successfully");
      // You can add a toast notification here if you have a toast library
    } catch (e) {
      console.error(e);
      // Restore the backup on error
      setTrashedEmails(backup);
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return trashedEmails
      .filter(
        (e) =>
          e.subject?.toLowerCase().includes(s) ||
          e.from?.toLowerCase().includes(s) ||
          e.summary?.toLowerCase().includes(s)
      )
      .sort(
        (a, b) =>
          new Date(b.deleted_date || b.date || 0) -
          new Date(a.deleted_date || a.date || 0)
      );
  }, [trashedEmails, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageSlice = filtered.slice(start, start + pageSize);
  const active = trashedEmails.find((e) => e.email_id === selectedId) || null;

  return (
    <div
      className={`w-full min-h-screen px-2 md:px-4 lg:px-6 py-3 md:py-4 flex flex-col ${
        isDarkMode ? "bg-neutral-950" : "bg-white"
      }`}
    >
      <div className="w-full flex flex-col gap-2 flex-1 min-h-0">
        {fetchError && (
          <div className="mb-2 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-center text-sm">
            {fetchError}
          </div>
        )}

        {/* Actions Bar */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl backdrop-blur-xl border px-4 py-3 ${
            isDarkMode
              ? "bg-neutral-900/60 border-white/10"
              : "bg-white/80 border-gray-200 shadow"
          }`}
        >
          <div className="flex gap-3 items-center">
            <Trash2
              className={`w-5 h-5 ${
                isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            />
            <h1
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Trash :
            </h1>
            <span
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {trashedEmails.length}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full sm:w-72 ${
                isDarkMode
                  ? "bg-white/10 border-white/20"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search
                className={`w-4 h-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search trashed emails..."
                className={`bg-transparent outline-none text-sm flex-1 ${
                  isDarkMode
                    ? "text-white placeholder:text-gray-400"
                    : "text-gray-800 placeholder:text-gray-500"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => fetchTrashedEmails()}
                loading={isRefreshing}
                icon={RefreshCw}
              >
                Refresh
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={emptyTrash}
                disabled={isRefreshing || trashedEmails.length === 0}
                icon={AlertTriangle}
              >
                Empty Trash
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main two-pane layout */}
        <div
          className={`flex flex-col lg:flex-row gap-3 flex-1 min-h-0 h-full rounded-xl backdrop-blur-xl border overflow-hidden ${
            isDarkMode
              ? "bg-neutral-900/60 border-white/10"
              : "bg-white/80 border-gray-200 shadow"
          }`}
          style={{
            maxHeight: "calc(100vh - 170px)",
          }}
        >
          {/* List */}
          <div className="lg:w-80 xl:w-100 border-b lg:border-b-0 lg:border-r border-white/10 dark:border-white/10 flex flex-col min-h-0">
            <div
              className={`px-4 py-2 text-xs uppercase tracking-wide font-medium flex items-center gap-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Archive className="w-3 h-3" />
              Deleted Messages
            </div>
            <div
              className={`flex-1 overflow-y-auto ${
                isDarkMode ? "custom-scrollbar-dark" : "custom-scrollbar-light"
              }`}
              style={{
                maxHeight: "100%",
              }}
            >
              {pageSlice.length === 0 && (
                <div className="p-6 text-sm opacity-70 text-center flex flex-col items-center align-middle">
                  <Trash2
                    className={`w-12 h-12 mx-auto mb-3 ${
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <p>No deleted emails</p>
                  <p className="text-xs mt-1 opacity-60">Your trash is empty</p>
                </div>
              )}
              <ul className="divide-y divide-white/5 dark:divide-white/5">
                <AnimatePresence initial={false}>
                  {pageSlice.map((email) => {
                    const isActive = email.email_id === selectedId;
                    return (
                      <motion.li
                        key={email.email_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <button
                          onClick={() => setSelectedId(email.email_id)}
                          className={`w-full text-left px-4 py-3 flex flex-col gap-1 group transition-all ${
                            isActive
                              ? isDarkMode
                                ? "bg-red-600/20"
                                : "bg-red-50"
                              : isDarkMode
                              ? "hover:bg-white/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {(() => {
                                const raw = email.from || "Unknown";
                                const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
                                let name = raw;
                                let addr = "";
                                if (match) {
                                  name = match[1].trim();
                                  addr = match[2].trim();
                                } else if (raw.includes("@")) {
                                  addr = raw.trim();
                                  name = raw
                                    .split("@")[0]
                                    .replace(/[._-]+/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase());
                                }
                                return (
                                  <>
                                    <span
                                      className={`block text-[11px] font-semibold truncate ${
                                        isDarkMode
                                          ? "text-red-300"
                                          : "text-red-700"
                                      }`}
                                    >
                                      {name || "Unknown"}
                                    </span>
                                    {addr && (
                                      <span
                                        className={`block text-[10px] truncate ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {addr}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] opacity-60 shrink-0 block">
                                {email.deleted_date
                                  ? new Date(
                                      email.deleted_date
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                              <span className="text-[9px] opacity-40 shrink-0">
                                Deleted
                              </span>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-semibold truncate ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {email.subject || "(No subject)"}
                          </div>
                          <div
                            className={`text-xs line-clamp-2 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {email.summary || email.snippet || ""}
                          </div>
                          {!email.read && (
                            <span className="mt-1 inline-block w-2 h-2 rounded-full bg-red-400" />
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>
            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded disabled:opacity-40 hover:bg-white/10"
                >
                  Prev
                </button>
                <span className="opacity-70">
                  {page}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded disabled:opacity-40 hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 flex flex-col min-h-0 sticky top-0 self-start h-fit overflow-hidden px-0">
            {!active && (
              <div className="flex-1 flex items-center justify-center text-sm opacity-60 flex-col gap-2">
                <Trash2
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <span>Select a deleted email</span>
              </div>
            )}
            {active && (
              <div className="flex-1 p-6 space-y-4">
                {/* Parse sender info */}
                {(() => {
                  if (!active.from) return null;
                  const match = active.from.match(/^(.*?)\s*<([^>]+)>$/);
                  if (match) {
                    active.__parsedFrom = {
                      name: match[1].trim(),
                      email: match[2].trim(),
                    };
                  } else if (active.from.includes("@")) {
                    const raw = active.from.trim();
                    const localName = raw
                      .split("@")[0]
                      .replace(/[._-]+/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    active.__parsedFrom = { name: localName, email: raw };
                  } else {
                    active.__parsedFrom = { name: active.from, email: "" };
                  }
                  return null;
                })()}

                {/* Header with restore/delete actions */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className={`text-xl font-semibold leading-snug ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {active.subject || "(No subject)"}
                    </h2>
                    {active.__parsedFrom && (
                      <div className="mt-1">
                        <p
                          className={`text-sm font-medium leading-snug ${
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {active.__parsedFrom.name}
                        </p>
                        {active.__parsedFrom.email && (
                          <p
                            className={`text-xs break-all ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {active.__parsedFrom.email}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-1 space-y-1">
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Sent:{" "}
                        {active.date
                          ? new Date(active.date).toLocaleString()
                          : ""}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Deleted:{" "}
                        {active.deleted_date
                          ? new Date(active.deleted_date).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => restoreEmail(active.email_id)}
                      icon={RotateCcw}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => permanentlyDeleteEmail(active.email_id)}
                      icon={Trash2}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </div>

                {/* Content */}
                {(active.summary || active.full_body) && (
                  <div className="w-full">
                    {active.summary && (
                      <div
                        className={`p-4 rounded-xl border text-sm leading-relaxed relative w-full ${
                          isDarkMode
                            ? "bg-white/5 border-white/10 text-gray-200"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-2 opacity-70">
                          Summary
                        </h3>
                        <p className="whitespace-pre-line break-words text-[13px] leading-snug">
                          {active.summary}
                        </p>
                      </div>
                    )}
                    {active.full_body && (
                      <div
                        className={`p-4 rounded-xl border text-sm leading-relaxed w-full mt-6 ${
                          isDarkMode
                            ? "bg-white/5 border-white/10 text-gray-300"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-2 opacity-70">
                          Content
                        </h3>
                        <p className="whitespace-pre-line break-words text-[13px] leading-snug">
                          {active.full_body}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {!active.full_body && active.snippet && (
                  <div className={`text-xs italic opacity-60`}>
                    {active.snippet}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trash;
