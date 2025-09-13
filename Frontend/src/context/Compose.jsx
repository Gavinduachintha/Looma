import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import {
  Send,
  Loader2,
  Bot,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Type,
} from "lucide-react";

// Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder, isDarkMode }) => {
  const editorRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("3");

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger a re-render to update button states
    handleInput();
  };

  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleFocus = () => {
    setIsToolbarVisible(true);
  };

  const handleBlur = (e) => {
    // Only hide toolbar if not clicking on toolbar buttons
    if (!e.relatedTarget?.closest(".toolbar")) {
      setTimeout(() => {
        setIsToolbarVisible(false);
        setShowFontSizeDropdown(false);
        setShowColorPicker(false);
      }, 150);
    }
  };

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".toolbar")) {
        setShowFontSizeDropdown(false);
        setShowColorPicker(false);
      }
    };

    if (showFontSizeDropdown || showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFontSizeDropdown, showColorPicker]);

  const toolbarButtons = [
    { command: "bold", icon: Bold, title: "Bold" },
    { command: "italic", icon: Italic, title: "Italic" },
    { command: "underline", icon: Underline, title: "Underline" },
    { command: "insertUnorderedList", icon: List, title: "Bullet List" },
    { command: "insertOrderedList", icon: ListOrdered, title: "Numbered List" },
    { command: "justifyLeft", icon: AlignLeft, title: "Align Left" },
    { command: "justifyCenter", icon: AlignCenter, title: "Align Center" },
    { command: "justifyRight", icon: AlignRight, title: "Align Right" },
  ];

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      formatText("createLink", url);
    }
  };

  const changeFontSize = (size) => {
    formatText("fontSize", size);
    setCurrentFontSize(size);
    setShowFontSizeDropdown(false);
  };

  const fontSizeOptions = [
    { value: "1", label: "Small", preview: "text-xs" },
    { value: "3", label: "Normal", preview: "text-sm" },
    { value: "5", label: "Large", preview: "text-base" },
    { value: "7", label: "Extra Large", preview: "text-lg" },
  ];

  const colorOptions = [
    "#000000",
    "#374151",
    "#6b7280",
    "#9ca3af",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  return (
    <div className="relative flex flex-col h-full">
      <AnimatePresence>
        {isToolbarVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`toolbar absolute top-0 left-0 right-0 z-10 flex flex-wrap items-center gap-1 p-2 rounded-t-xl border-b ${
              isDarkMode
                ? "bg-neutral-800/95 border-white/20 backdrop-blur-xl"
                : "bg-white/95 border-gray-200 backdrop-blur-xl"
            }`}
          >
            {/* Font Size */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                className={`px-2 py-1 rounded text-xs border flex items-center gap-1 min-w-[70px] ${
                  isDarkMode
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                    : "bg-white border-gray-300 text-gray-800 hover:border-gray-400"
                }`}
              >
                <Type className="w-3 h-3" />
                <span>
                  {fontSizeOptions.find((opt) => opt.value === currentFontSize)
                    ?.label || "Normal"}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    showFontSizeDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showFontSizeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-0 mt-1 rounded-lg border shadow-lg z-50 overflow-hidden backdrop-blur-xl min-w-[120px] ${
                      isDarkMode
                        ? "bg-neutral-800/95 border-white/20"
                        : "bg-white/95 border-gray-200"
                    }`}
                  >
                    {fontSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeFontSize(option.value)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          isDarkMode
                            ? "hover:bg-white/10 text-white"
                            : "hover:bg-gray-50 text-gray-800"
                        } ${
                          currentFontSize === option.value
                            ? isDarkMode
                              ? "bg-emerald-600/20 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700"
                            : ""
                        }`}
                      >
                        <span className={option.preview}>{option.label}</span>
                        {currentFontSize === option.value && (
                          <Check className="w-3 h-3 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className={`w-px h-6 ${
                isDarkMode ? "bg-white/20" : "bg-gray-300"
              }`}
            />

            {/* Formatting Buttons */}
            {toolbarButtons.map(({ command, icon: Icon, title }) => {
              const isActive = isCommandActive(command);
              return (
                <button
                  key={command}
                  type="button"
                  onClick={() => formatText(command)}
                  title={title}
                  className={`p-1.5 rounded transition-colors ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-500"
                      : isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}

            <div
              className={`w-px h-6 ${
                isDarkMode ? "bg-white/20" : "bg-gray-300"
              }`}
            />

            {/* Link Button */}
            <button
              type="button"
              onClick={insertLink}
              title="Insert Link"
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Link className="w-4 h-4" />
            </button>

            {/* Text Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
                className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                  showColorPicker
                    ? "bg-emerald-500/20 text-emerald-500"
                    : isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Type className="w-4 h-4" />
                  <div className="w-4 h-1 bg-current rounded-full mt-0.5"></div>
                </div>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    showColorPicker ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-0 mt-1 rounded-lg border shadow-xl z-50 overflow-hidden backdrop-blur-xl p-3 ${
                      isDarkMode
                        ? "bg-neutral-800/95 border-white/20"
                        : "bg-white/95 border-gray-200"
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <div
                          className={`text-xs font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Quick Colors
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                formatText("foreColor", color);
                                setShowColorPicker(false);
                              }}
                              className="w-6 h-6 rounded border-2 border-white/20 hover:scale-110 transition-transform shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Input */}
                      <div className="pt-2 border-t border-white/10">
                        <div
                          className={`text-xs font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Custom Color
                        </div>
                        <input
                          type="color"
                          onChange={(e) => {
                            formatText("foreColor", e.target.value);
                            setShowColorPicker(false);
                          }}
                          className="w-full h-8 rounded cursor-pointer border border-white/20"
                          title="Custom Color"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: value }}
        className={`rich-text-editor w-full px-3 py-2 rounded-xl border focus:outline-none text-sm resize-none ${
          isToolbarVisible ? "rounded-t-none pt-12" : ""
        } ${
          isDarkMode
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white border-gray-300 text-gray-800"
        } ${isDarkMode ? "custom-scrollbar-dark" : "custom-scrollbar-light"}`}
        style={{
          height: "100%",
          minHeight: "200px",
          overflowY: "auto",
          lineHeight: "1.5",
          wordWrap: "break-word",
        }}
        suppressContentEditableWarning={true}
      />

      {!value && (
        <div
          className={`absolute top-2 left-3 pointer-events-none text-sm ${
            isToolbarVisible ? "top-14" : "top-2"
          } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  isOpen,
  setIsOpen,
  isDarkMode,
}) => {
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        className={`block text-sm font-medium mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm text-left flex items-center justify-between transition-all ${
          isDarkMode
            ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
            : "bg-white border-gray-300 text-gray-800 hover:border-gray-400"
        } ${isOpen ? "ring-2 ring-emerald-500/20" : ""}`}
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden backdrop-blur-xl ${
              isDarkMode
                ? "bg-neutral-800/95 border-white/20 shadow-black/20"
                : "bg-white/95 border-gray-200 shadow-gray-200/50"
            }`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                  isDarkMode
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-gray-50 text-gray-800"
                } ${
                  value === option.value
                    ? isDarkMode
                      ? "bg-emerald-600/20 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700"
                    : ""
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Compose = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  // AI Form Tab state
  const [showAiTab, setShowAiTab] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);
  const [aiPreferences, setAiPreferences] = useState({
    tone: "professional",
    purpose: "",
    keyPoints: "",
    length: "medium",
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      toast.error("Please fill all fields before sending");
      return;
    }
    try {
      setSending(true);
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/sendEmail",
        { to, cc, bcc, subject, body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email sent successfully");
      navigate("/emails"); // go back to inbox
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  // Dropdown options
  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "casual", label: "Casual" },
  ];

  const lengthOptions = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
  ];

  const handleAiGenerate = async () => {
    if (!aiPreferences.purpose.trim()) {
      toast.error("Please describe the purpose of your email");
      return;
    }

    try {
      setAiGenerating(true);
      const token = localStorage.getItem("authToken");

      // Show loading toast
      const loadingToast = toast.loading("Generating email with AI...");

      // Call the AI endpoint with preferences
      const response = await axios.post(
        "http://localhost:3000/generateEmail",
        {
          preferences: aiPreferences,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000, // 30 second timeout
        }
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.data.subject) {
        setSubject(response.data.subject);
      }
      if (response.data.body) {
        setBody(response.data.body);
      }

      toast.success("Email generated successfully!");
      setShowAiTab(false);
    } catch (err) {
      console.error(err);

      // More specific error messages
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please sign in again.");
      } else if (err.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error("Failed to generate email. Please try again.");
      }
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div
      className={`w-full h-screen px-2 md:px-4 lg:px-6 py-3 md:py-4 flex flex-col ${
        isDarkMode ? "bg-neutral-950" : "bg-white"
      }`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-4xl mx-auto rounded-xl backdrop-blur-xl border shadow-lg flex flex-col ${
          isDarkMode
            ? "bg-neutral-900/60 border-white/10"
            : "bg-white/80 border-gray-200"
        }`}
        style={{ height: "calc(100vh - 2rem)" }}
      >
        {/* Header with AI Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h1
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Compose Email
          </h1>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiTab(!showAiTab)}
            icon={showAiTab ? ChevronUp : Bot}
            className="gap-2 w-32"
          >
            AI Assistant
            {!showAiTab && <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* AI Form Tab */}
        <AnimatePresence>
          {showAiTab && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-b border-white/10 overflow-hidden ${
                isDarkMode ? "bg-neutral-800/50" : "bg-gray-50/80"
              }`}
            >
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  <h3
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    AI Email Generator
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomDropdown
                    label="Tone"
                    value={aiPreferences.tone}
                    options={toneOptions}
                    onChange={(value) =>
                      setAiPreferences((prev) => ({ ...prev, tone: value }))
                    }
                    isOpen={showToneDropdown}
                    setIsOpen={setShowToneDropdown}
                    isDarkMode={isDarkMode}
                  />

                  <CustomDropdown
                    label="Length"
                    value={aiPreferences.length}
                    options={lengthOptions}
                    onChange={(value) =>
                      setAiPreferences((prev) => ({ ...prev, length: value }))
                    }
                    isOpen={showLengthDropdown}
                    setIsOpen={setShowLengthDropdown}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Purpose/Topic *
                  </label>
                  <input
                    type="text"
                    value={aiPreferences.purpose}
                    onChange={(e) =>
                      setAiPreferences((prev) => ({
                        ...prev,
                        purpose: e.target.value,
                      }))
                    }
                    placeholder="e.g., Schedule a meeting, Follow up on proposal, Thank you note..."
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm ${
                      isDarkMode
                        ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Key Points (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={aiPreferences.keyPoints}
                    onChange={(e) =>
                      setAiPreferences((prev) => ({
                        ...prev,
                        keyPoints: e.target.value,
                      }))
                    }
                    placeholder="Any specific points you want to include..."
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm resize-none ${
                      isDarkMode
                        ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiTab(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating || !aiPreferences.purpose.trim()}
                    loading={aiGenerating}
                    icon={Sparkles}
                  >
                    {aiGenerating ? "Generating..." : "Generate Email"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <div className="px-6 py-6 flex-1 flex flex-col overflow-hidden">
          <form
            onSubmit={handleSend}
            className="space-y-5 flex-1 flex flex-col"
          >
            {/* To */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  To
                </label>
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {showCcBcc ? "Hide" : "CC/BCC"}
                </button>
              </div>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm ${
                  isDarkMode
                    ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                }`}
              />
            </div>

            {/* CC/BCC Fields */}
            <AnimatePresence>
              {showCcBcc && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* CC */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      CC
                    </label>
                    <input
                      type="email"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc@example.com (optional)"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                      }`}
                    />
                  </div>

                  {/* BCC */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      BCC
                    </label>
                    <input
                      type="email"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="bcc@example.com (optional)"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none text-sm ${
                  isDarkMode
                    ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
                }`}
              />
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Message
              </label>
              <div className="flex-1">
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Write your email..."
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                type="button"
                onClick={() => navigate("/emails")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={sending}
                loading={sending}
                icon={Send}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Compose;
