import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCount } from "../context/CountContext";
import EventModal from "../components/EventModal";
import {
  RotateCw,
  RefreshCw,
  Sparkles,
  CalendarPlus,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";

// Emails management page: full list, search, summarize, detail viewer
const Emails = () => {
  const { isDarkMode } = useTheme();
  const { refreshCounts } = useCount();
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) navigate("/signin");
    fetchEmails();
  }, []); // eslint-disable-line

  const fetchEmails = async (showLoader = true) => {
    if (showLoader) setIsRefreshing(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/fetchEmails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data || [];
      setEmails(list);
      if (!selectedId && list.length) setSelectedId(list[0].email_id);
      // Refresh counts when emails are fetched
      refreshCounts();
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/signin");
      } else if (e.response?.status === 403) {
        setFetchError(
          "You do not have permission to view these emails. Please check your login or contact support."
        );
        toast.error("Forbidden: You do not have access to this resource.");
      } else {
        setFetchError("Failed to fetch emails. Please try again later.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNewSummary = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("authToken");
      toast.loading("Generating summaries...", { id: "summary-loading" });

      await axios.get("http://localhost:3000/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Automatically refresh emails to show updated summaries
      await fetchEmails(false);

      toast.success("Summaries generated and emails refreshed!", {
        id: "summary-loading",
      });
    } catch (e) {
      console.error("Summary error:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error status:", e.response?.status);

      const errorMessage =
        e.response?.data?.error || "Failed to generate summaries";
      toast.error(errorMessage, {
        id: "summary-loading",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (emailId, read) => {
    try {
      await axios.post("http://localhost:3000/isRead", { emailId, read });
      setEmails((prev) =>
        prev.map((e) => (e.email_id === emailId ? { ...e, read } : e))
      );
      // Refresh counts when email read status changes
      refreshCounts();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEmail = async (emailId) => {
    const backup = emails;
    setEmails((prev) => prev.filter((e) => e.email_id !== emailId));
    if (selectedId === emailId) setSelectedId(null);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/moveToTrash",
        { emailId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email moved to trash");
    } catch (e) {
      console.error(e);
      toast.error("Failed to move email to trash");
      setEmails(backup);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/addEvent",
        eventData,
        { withCredentials: true }
      );
      toast.success("Event created");
      setShowEventModal(false);
      return res.data;
    } catch (error) {
      console.error("Add event failed", error?.response?.data || error.message);
      toast.error(error?.response?.data?.error || "Failed to create event");
      throw error;
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return emails
      .filter(
        (e) =>
          e.subject?.toLowerCase().includes(s) ||
          e.from?.toLowerCase().includes(s) ||
          e.summary?.toLowerCase().includes(s)
      )
      .sort(
        (a, b) =>
          new Date(b.date || b.timestamp || 0) -
          new Date(a.date || a.timestamp || 0)
      );
  }, [emails, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageSlice = filtered.slice(start, start + pageSize);
  const active = emails.find((e) => e.email_id === selectedId) || null;

  return (
    <>
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
              <h1
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Emails :
              </h1>
              <span
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {emails.length}
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
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search emails..."
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
                  onClick={() => fetchEmails()}
                  loading={isRefreshing}
                  icon={RefreshCw}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNewSummary}
                  disabled={isRefreshing}
                  icon={Sparkles}
                >
                  Summarize
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
              // Ensure the two-pane region fills remaining viewport so only the list scrolls
              maxHeight: "calc(109vh - 170px)", // rough offset for header + actions bar
            }}
          >
            {/* List */}
            <div className="lg:w-80 xl:w-100 border-b lg:border-b-0 lg:border-r border-white/10 dark:border-white/10 flex flex-col min-h-">
              <div
                className={`px-4 py-2 text-xs uppercase tracking-wide font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Messages
              </div>
              <div
                className={`flex-1 overflow-y-auto ${
                  isDarkMode
                    ? "custom-scrollbar-dark"
                    : "custom-scrollbar-light"
                }`}
                style={{
                  // Independent scroll container for list only
                  maxHeight: "100%",
                }}
              >
                {pageSlice.length === 0 && (
                  <div className="p-6 text-sm opacity-70">No emails</div>
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
                                  ? "bg-emerald-600/20"
                                  : "bg-emerald-50"
                                : isDarkMode
                                ? "hover:bg-white/5"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {(() => {
                                  const raw = email.from || "Unknown";
                                  const match =
                                    raw.match(/^(.*?)\s*<([^>]+)>$/);
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
                                            ? "text-emerald-300"
                                            : "text-emerald-700"
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
                              <span className="text-[10px] opacity-60 shrink-0">
                                {email.date
                                  ? new Date(email.date).toLocaleDateString()
                                  : ""}
                              </span>
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
                              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-green-400" />
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
                <div className="flex-1 flex items-center justify-center text-sm opacity-60">
                  Select an email
                </div>
              )}
              {active && (
                <div className="flex-1 p-6 space-y-4">
                  {/** Derive sender name & address if format is "Name <email@domain>" */}
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
                    return null; // nothing to render here; side-effect only
                  })()}
                  {/* Email header info */}
                  <div className="mb-4">
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
                    <p
                      className={`text-xs mt-0.5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {active.date
                        ? new Date(active.date).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {/* Fixed position action buttons */}
                  <div className="flex gap-2 flex-wrap justify-end mb-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowEventModal(true)}
                      icon={CalendarPlus}
                    >
                      Add Event
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(active.email_id, !active.read)}
                      icon={active.read ? EyeOff : Eye}
                    >
                      {active.read ? "Mark Unread" : "Mark Read"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEmail(active.email_id)}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
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
                          {(() => {
                            const raw = active.summary || "";
                            const lines = raw.split(/\r?\n/);
                            const sectionTitles = [
                              "Summary",
                              "Events",
                              "Links",
                            ];
                            const sections = {};
                            let current = "Summary";
                            sections[current] = [];
                            for (let ln of lines) {
                              const trimmed = ln.trim();
                              const titleMatch = sectionTitles.find((t) =>
                                new RegExp(`^${t}:?$`, "i").test(trimmed)
                              );
                              if (titleMatch) {
                                current = titleMatch;
                                if (!sections[current]) sections[current] = [];
                                continue;
                              }
                              if (current === "Links" && trimmed === "-")
                                continue; // ignore placeholder dash
                              if (!sections[current]) sections[current] = [];
                              sections[current].push(ln);
                            }
                            const urlRegex =
                              /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
                            const renderLines = (arr) => {
                              return arr.flatMap((line) => {
                                if (!line) return [];
                                // Extract URLs and separate
                                const parts = [];
                                let last = 0;
                                let m;
                                const text = line;
                                urlRegex.lastIndex = 0;
                                while ((m = urlRegex.exec(text)) !== null) {
                                  if (m.index > last)
                                    parts.push({
                                      type: "text",
                                      value: text.slice(last, m.index),
                                    });
                                  parts.push({ type: "url", value: m[0] });
                                  last = m.index + m[0].length;
                                }
                                if (last < text.length)
                                  parts.push({
                                    type: "text",
                                    value: text.slice(last),
                                  });
                                return parts;
                              });
                            };
                            const buildBullets = (arr) =>
                              arr
                                .filter((l) => l.trim().startsWith("- "))
                                .map((l) => l.replace(/^\-\s*/, ""));
                            const buildParagraphs = (arr) =>
                              arr.filter(
                                (l) => l.trim() && !l.trim().startsWith("- ")
                              );
                            const linkLines = sections.Links || [];
                            const linkUrls = [];
                            linkLines.forEach((l) => {
                              let match;
                              urlRegex.lastIndex = 0;
                              const local = [];
                              while ((match = urlRegex.exec(l)) !== null)
                                local.push(match[0]);
                              if (local.length === 0 && l.trim())
                                linkUrls.push(l.trim());
                              else linkUrls.push(...local);
                            });
                            const bulletSections = {};
                            ["Summary", "Events"].forEach((sec) => {
                              if (sections[sec])
                                bulletSections[sec] = buildBullets(
                                  sections[sec]
                                );
                            });
                            const paragraphSections = {};
                            ["Summary", "Events"].forEach((sec) => {
                              if (sections[sec])
                                paragraphSections[sec] = buildParagraphs(
                                  sections[sec]
                                ).filter(
                                  (t) => !/^Summary:|^Events:/i.test(t.trim())
                                );
                            });
                            const truncateUrl = (u) =>
                              u.length > 90 ? u.slice(0, 87) + "…" : u;
                            return (
                              <div className="space-y-5">
                                {["Summary", "Events"].map(
                                  (sec) =>
                                    sections[sec] &&
                                    (bulletSections[sec].length ||
                                      paragraphSections[sec].length) && (
                                      <div key={sec}>
                                        <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 opacity-70">
                                          {sec}
                                        </h4>
                                        {paragraphSections[sec].length > 0 && (
                                          <div className="space-y-2 text-[13px] leading-snug">
                                            {paragraphSections[sec].map(
                                              (p, i) => (
                                                <p
                                                  key={i}
                                                  className="whitespace-pre-wrap break-words"
                                                >
                                                  {p}
                                                </p>
                                              )
                                            )}
                                          </div>
                                        )}
                                        {bulletSections[sec].length > 0 && (
                                          <ul className="list-disc pl-5 space-y-1 text-[13px] leading-snug">
                                            {bulletSections[sec].map((b, i) => (
                                              <li
                                                key={i}
                                                className="break-words"
                                              >
                                                {b}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    )
                                )}
                                {linkUrls.length > 0 && (
                                  <div>
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 opacity-70">
                                      Links
                                    </h4>
                                    <div className="space-y-1">
                                      {linkUrls.map((u, i) => {
                                        const href = u.startsWith("http")
                                          ? u
                                          : `https://${u}`;
                                        return (
                                          <a
                                            key={i}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-[12px] text-emerald-500 underline break-all hover:text-emerald-400 leading-tight"
                                          >
                                            {truncateUrl(u)}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
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
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        emailData={{
          subject: active?.subject || "",
          summary: active?.summary || "",
          from: active?.from_email || active?.from || "",
          date: active?.date,
        }}
        onCreateEvent={handleCreateEvent}
      />
    </>
  );
};

export default Emails;
