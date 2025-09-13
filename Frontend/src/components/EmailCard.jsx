import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import EventModal from "./EventModal";
import Button from "./ui/Button";
import axios from "axios";
// Lucide icons
import {
  Trash2,
  Check,
  Mail as MailIcon,
  MailOpen,
  CalendarPlus,
  Expand,
  X,
} from "lucide-react";
// Business focused sleek email card (modern + colored action buttons)
// Accept isDarkMode from parent to keep cards in sync with global theme

const EmailCard = ({
  email,
  onMarkAsRead,
  onDelete,
  isDarkMode,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const handleAddEvent = (e) => {
    e.stopPropagation();
    setShowEventModal(true);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/addEvent",
        eventData,
        { withCredentials: true }
      );
      console.log("Event created successfully:", response.data);
      alert("Event created successfully!");
      setShowEventModal(false);
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Backend error:", error.response.data);
        alert(error.response.data.error || "Failed to create event");
      } else if (error.request) {
        // Request was made but no response
        console.error("No response from backend:", error.request);
        alert("No response from backend. Is the server running?");
      } else {
        // Something else happened
        console.error("Error creating event:", error.message);
        alert("Error creating event: " + error.message);
      }
      throw error;
    }
  };

  // Design tokens - Exact Supabase theme like screenshots
  const baseBg = compact
    ? isDarkMode
      ? "#171717" // Very dark like Supabase
      : "#ffffff"
    : isDarkMode
    ? "#171717" // Very dark like Supabase
    : "rgba(255, 255, 255, 0.9)";
  const hoverBg = compact
    ? isDarkMode
      ? "#1a1a1a" // Darker hover
      : "rgba(60, 207, 142, 0.05)"
    : isDarkMode
    ? "#1a1a1a" // Darker hover
    : "rgba(60, 207, 142, 0.08)";
  const borderColor = compact
    ? isDarkMode
      ? "#262626" // Subtle dark border
      : "rgba(60, 207, 142, 0.15)"
    : isDarkMode
    ? "#262626" // Subtle dark border
    : "rgba(60, 207, 142, 0.2)";
  const subtleShadow = compact
    ? isDarkMode
      ? "0 1px 3px 0 rgba(0,0,0,0.5)"
      : "0 1px 3px 0 rgba(60, 207, 142, 0.1)"
    : isDarkMode
    ? "0 2px 8px 0 rgba(0,0,0,0.4)"
    : "0 2px 8px 0 rgba(60, 207, 142, 0.15)";
  const hoverShadow = compact
    ? isDarkMode
      ? "0 2px 6px 0 rgba(0,0,0,0.6)"
      : "0 2px 6px 0 rgba(60, 207, 142, 0.25)"
    : isDarkMode
    ? "0 4px 16px 0 rgba(0,0,0,0.5)"
    : "0 4px 16px 0 rgba(60, 207, 142, 0.3)";

  // Accent colors used across card/modal (dynamic to theme)
  const accentStart = isDarkMode ? "#10b981" : "#3ecf8e";
  const accentEnd = isDarkMode ? "#059669" : "#10b981";

  // Derive a display name and email address from the 'from_email' field
  let displayName = "Unknown";
  let senderEmail = "";

  if (email) {
    // Try to get email from various possible fields
    const rawFromField =
      email.from_email || email.from || email.sender || email.fromEmail || "";

    // Try to get display name from various possible fields first
    if (email.from_name || email.fromName || email.senderName) {
      displayName = email.from_name || email.fromName || email.senderName;
      senderEmail = rawFromField;
    } else if (rawFromField) {
      // Parse email field that might contain "Name <email@domain.com>" format
      const angleMatch = rawFromField.match(/^(.+?)\s*<(.+?)>$/);
      if (angleMatch) {
        // Found "Name <email>" format
        displayName = angleMatch[1].trim();
        senderEmail = angleMatch[2].trim();
      } else {
        // Just an email address, create display name from it
        senderEmail = rawFromField;
        const local = senderEmail.split("@")[0];
        if (local && local.trim()) {
          displayName = local
            .replace(/[._-]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .slice(0, 3)
            .join(" ");
        } else {
          displayName = senderEmail;
        }
      }
    }
  }

  // Extract and format the date from the email object (robust across possible field names)
  let date = "";
  const rawDate =
    (email &&
      (email.date ||
        email.receivedAt ||
        email.sentAt ||
        email.received ||
        email.timestamp ||
        email.createdAt)) ||
    null;
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        date = d.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        date = String(rawDate);
      }
    } catch {
      date = String(rawDate);
    }
  }

  // Helper to highlight and linkify URLs in text
  const linkify = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 break-all"
            style={{
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              WebkitHyphens: "auto",
              hyphens: "auto",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Parse summary for bullet points
  const bulletPoints =
    email && email.summary
      ? email.summary
          .split(/\r?\n/)
          .filter((line) => line.trim().startsWith("- "))
          .map((line) => line.replace(/^-\s*/, ""))
      : [];

  // Remove events array if present in summary
  const summaryWithoutEvents =
    email && email.summary
      ? email.summary.replace(/Events:\s*\[.*?\]/gs, "").trim()
      : "";

  // Animation variants for modal
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.18, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 8,
      transition: { duration: 0.12, ease: "easeIn" },
    },
  };

  const cardVariants = {
    initial: { scale: 1, boxShadow: subtleShadow },
    hover: {
      scale: 1.015,
      boxShadow: hoverShadow,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    tap: { scale: 0.99 },
  };

  if (!email) return null;

  return (
    <>
      <motion.div
        key={(compact ? "compact-" : "full-") + (isDarkMode ? "dark" : "light")}
        className={`group relative w-full border flex flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-400 ${
          compact
            ? `rounded-xl ${
                isDarkMode
                  ? "focus-visible:ring-emerald-400/40 focus-visible:ring-offset-zinc-900"
                  : "focus-visible:ring-emerald-500/40 focus-visible:ring-offset-white"
              } p-4 min-h-[120px]`
            : `rounded-2xl ${
                isDarkMode
                  ? "focus-visible:ring-emerald-200/70 focus-visible:ring-offset-zinc-900"
                  : "focus-visible:ring-emerald-400/60 focus-visible:ring-offset-[#f8fafc]"
              } p-6 min-h-[200px]`
        }`}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        tabIndex={0}
        aria-label={`Email from ${displayName}`}
        data-read={email && email.read}
        style={{
          borderColor,
          background: baseBg,
          boxShadow: subtleShadow,
          transition: "background 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = baseBg;
          e.currentTarget.style.boxShadow = subtleShadow;
        }}
      >
        {/* Accent bar */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1"
          style={{
            background:
              email && !email.read
                ? "linear-gradient(180deg, #3ecf8e, #10b981)"
                : isDarkMode
                ? "rgba(60, 207, 142, 0.1)"
                : "rgba(60, 207, 142, 0.15)",
            opacity: 1,
          }}
        />

        {/* Unread subtle badge (top-right) */}
        {email && !email.read && !compact && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30"
          >
            NEW
          </motion.span>
        )}

        {/* Header section: avatar, name, email, status pill */}
        <div
          className={`flex items-start relative z-10 ${
            compact ? "gap-2 mb-2" : "gap-3 mb-3"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`${
                compact
                  ? "w-8 h-8 rounded-lg text-[10px]"
                  : "w-12 h-12 rounded-xl text-sm"
              } flex items-center justify-center font-bold shrink-0 shadow-sm`}
              style={{
                background: isDarkMode ? "#10b981" : "#3ecf8e",
                color: "white",
                border: isDarkMode
                  ? "1px solid rgba(60, 207, 142, 0.2)"
                  : "1px solid rgba(60, 207, 142, 0.2)",
              }}
            >
              {(displayName || "?").charAt(0)}
            </div>
            {/* Small vertical line under avatar */}
            <div
              className={`w-0.5 ${compact ? "h-4 mt-1" : "h-6 mt-2"}`}
              style={{
                background: isDarkMode
                  ? "rgba(60, 207, 142, 0.4)"
                  : "rgba(60, 207, 142, 0.6)",
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`flex flex-col gap-0.5 ${compact ? "mb-0.5" : "mb-1"}`}
            >
              <span
                className={`${
                  compact ? "text-sm" : "text-lg"
                } font-semibold truncate leading-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}
                title={displayName}
              >
                {displayName}
              </span>
              <span
                className={`${
                  compact ? "text-[11px]" : "text-sm"
                } truncate tracking-wide ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
                title={senderEmail}
              >
                {senderEmail}
              </span>
            </div>
            <p
              className={`${
                compact ? "text-[12px] mb-1" : "text-base mb-2"
              } font-medium truncate ${
                isDarkMode ? "text-slate-200" : "text-slate-700"
              }`}
              title={email && email.subject ? email.subject : ""}
            >
              {email && email.subject ? email.subject : "No subject"}
            </p>
            {!compact && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
                    email && email.read
                      ? isDarkMode
                        ? "bg-slate-800/40 text-slate-300 border-slate-600/50"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-400/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      email && email.read ? "bg-slate-400" : "bg-indigo-500"
                    }`}
                  />
                  {email && email.read ? "Read" : "Unread"}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Summary preview (compact: single line snippet) */}
        <div className={`relative z-10 ${compact ? "mb-2" : "mb-4"} flex-1`}>
          {(() => {
            if (compact) {
              const snippetSource =
                bulletPoints[0] || summaryWithoutEvents || "";
              const snippet =
                snippetSource.length > 120
                  ? snippetSource.slice(0, 117) + "…"
                  : snippetSource;
              return (
                <p
                  className={`text-xs leading-snug ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={snippetSource}
                >
                  {linkify(snippet)}
                </p>
              );
            }
            if (bulletPoints.length > 0) {
              return (
                <ul
                  className={`text-sm leading-relaxed space-y-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {bulletPoints.slice(0, 3).map((point, i) => (
                    <li key={i} className="truncate" title={point}>
                      {linkify(point)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {summaryWithoutEvents}
              </p>
            );
          })()}
        </div>

        {/* Footer actions */}
        <div
          className={`mt-auto relative z-10 ${
            compact ? "pt-2" : "pt-4"
          } border-t`}
          style={{
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
          }}
        >
          {!compact && (
            <span
              className={`block text-xs font-medium ${
                compact ? "mb-1" : "mb-3"
              } tracking-wide ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {date}
            </span>
          )}
          <div
            className={`flex flex-row flex-wrap items-center ${
              compact ? "gap-1" : "gap-2"
            }`}
          >
            {/* Delete */}
            <Button
              variant="destructive"
              size={compact ? "sm" : "md"}
              onClick={(e) => {
                e.stopPropagation();
                const id = email && (email.email_id || email._id || email.id);
                if (!id) return console.warn("Delete no id", email);
                onDelete && onDelete(id);
              }}
              aria-label="Delete email"
              title="Delete email"
              icon={Trash2}
              as={motion.button}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              className={
                compact
                  ? `${
                      isDarkMode
                        ? "bg-red-500/30 text-red-200 hover:bg-red-500/50"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    } w-7 h-7`
                  : `${
                      isDarkMode
                        ? "bg-red-500/30 text-red-200 hover:bg-red-500/50"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    } w-9 h-9`
              }
            />
            {/* Mark read / unread */}
            <Button
              variant={email && email.read ? "subtle" : "secondary"}
              size={compact ? "sm" : "md"}
              onClick={(e) => {
                e.stopPropagation();
                const id = email && (email.email_id || email._id || email.id);
                if (!id) return console.warn("MarkRead no id", email);
                onMarkAsRead && onMarkAsRead(id, !(email && email.read));
              }}
              aria-label={
                email && email.read ? "Mark as unread" : "Mark as read"
              }
              title={email && email.read ? "Mark as unread" : "Mark as read"}
              icon={email && email.read ? MailOpen : MailIcon}
              as={motion.button}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              className={
                compact
                  ? `${
                      email && email.read
                        ? isDarkMode
                          ? "bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50"
                          : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                        : isDarkMode
                        ? "bg-slate-700/40 text-slate-200 hover:bg-slate-600/60"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } w-7 h-7`
                  : `${
                      email && email.read
                        ? isDarkMode
                          ? "bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50"
                          : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                        : isDarkMode
                        ? "bg-slate-700/40 text-slate-200 hover:bg-slate-600/60"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } w-9 h-9`
              }
            />
            {/* Add event (hide in compact) */}
            {!compact && (
              <Button
                variant="primary"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddEvent(e);
                }}
                aria-label="Create event"
                title="Create event from email"
                icon={CalendarPlus}
                as={motion.button}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.94 }}
                className={`w-9 h-9 ${
                  isDarkMode
                    ? "bg-emerald-600/40 text-emerald-100 hover:bg-emerald-600/60"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              />
            )}
            {/* Expand / open */}
            <Button
              variant="secondary"
              size={compact ? "sm" : "md"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              aria-label="Open full view"
              title="Open full view"
              icon={Expand}
              as={motion.button}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              className={
                compact
                  ? `${
                      isDarkMode
                        ? "bg-teal-700/40 text-teal-100 hover:bg-teal-700/60"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    } w-7 h-7`
                  : `${
                      isDarkMode
                        ? "bg-teal-700/40 text-teal-100 hover:bg-teal-700/60"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    } w-9 h-9`
              }
            />
          </div>
        </div>
      </motion.div>
      {expanded &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setExpanded(false)}
            >
              <motion.div
                className={`rounded-3xl shadow-2xl p-8 max-w-3xl w-full relative flex flex-col mx-4 border no-scrollbar ${
                  isDarkMode ? "border-gray-600/70" : "border-slate-200"
                }`}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: baseBg,
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: subtleShadow,
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Subtle top divider accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${accentStart}, ${accentEnd})`,
                  }}
                />

                {/* Close button */}
                <button
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-20 ${
                    isDarkMode
                      ? "bg-gray-700/70 hover:bg-gray-600 text-gray-300 hover:text-white"
                      : "bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-800"
                  }`}
                  onClick={() => setExpanded(false)}
                  aria-label="Close modal"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-full mb-6 flex items-start gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg"
                    style={{
                      background: isDarkMode ? accentStart : accentStart,
                      color: "white",
                    }}
                  >
                    {(displayName || senderEmail || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`text-xl font-semibold tracking-tight leading-snug ${
                        isDarkMode ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {displayName || "Unknown Sender"}
                    </h2>
                    <p
                      className={`text-sm mt-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {senderEmail || "No email address"}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
                          email && email.read
                            ? "bg-emerald-600 text-slate-300 border-emerald-600"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-400/30"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            email && email.read
                              ? "bg-emerald-600"
                              : "bg-emerald-500"
                          }`}
                        />
                        {email && email.read ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>
                </div>

                <h3
                  className={`text-lg font-semibold mb-6 leading-snug ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {email && email.subject ? email.subject : "No subject"}
                </h3>

                <div className="w-full mb-8">
                  {bulletPoints.length > 0 ? (
                    <ul
                      className={`text-base list-disc pl-6 space-y-3 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {bulletPoints.map((p, i) => (
                        <li key={i}>{linkify(p)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className={`text-base whitespace-pre-line leading-relaxed ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {linkify(summaryWithoutEvents)}
                    </p>
                  )}
                </div>

                <div
                  className="mt-auto pt-6 w-full border-t"
                  style={{
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)",
                  }}
                >
                  <span
                    className={`block text-sm font-medium mb-4 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {date}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {/* Add Event */}
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddEvent}
                      aria-label="Add event"
                      title="Add event"
                      icon={CalendarPlus}
                      as={motion.button}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      className={`w-11 h-11 rounded-full ${
                        isDarkMode
                          ? "bg-emerald-600/40 text-emerald-100 hover:bg-emerald-600/60"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    />
                    {/* Delete */}
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={() => onDelete && onDelete(email && email._id)}
                      aria-label="Delete email"
                      title="Delete email"
                      icon={Trash2}
                      as={motion.button}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      className={`w-11 h-11 rounded-full ${
                        isDarkMode
                          ? "bg-red-500/30 text-red-200 hover:bg-red-500/50"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    />
                    {/* Mark Read / Unread */}
                    <Button
                      variant={email && email.read ? "subtle" : "primary"}
                      size="lg"
                      onClick={() => {
                        const id =
                          email && (email.email_id || email._id || email.id);
                        if (!id)
                          return console.warn("MarkRead (modal) no id", email);
                        onMarkAsRead &&
                          onMarkAsRead(id, !(email && email.read));
                      }}
                      aria-label={
                        email && email.read ? "Mark as unread" : "Mark as read"
                      }
                      title={
                        email && email.read ? "Mark as unread" : "Mark as read"
                      }
                      icon={email && email.read ? MailOpen : MailIcon}
                      as={motion.button}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      className={`w-11 h-11 rounded-full ${
                        email && email.read
                          ? isDarkMode
                            ? "bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50"
                            : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          : isDarkMode
                          ? "bg-emerald-600/40 text-emerald-100 hover:bg-emerald-600/60"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Comprehensive Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        emailData={{
          subject: email?.subject || "",
          summary: email?.summary || "",
          from: email?.from_email || email?.from || "",
          date: date,
        }}
        onCreateEvent={handleCreateEvent}
      />
    </>
  );
};

export default EmailCard;
