import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import CustomDateTimePicker from "./CustomDateTimePicker";

const ComprehensiveEventModal = ({
  isOpen,
  onClose,
  emailData,
  onCreateEvent,
}) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState("");

  // Theme tokens to match app UI
  const baseBg = isDarkMode ? "#171717" : "rgba(255,255,255,0.95)";
  const borderColor = isDarkMode ? "#262626" : "rgba(60, 207, 142, 0.12)";
  const subtleShadow = isDarkMode
    ? "0 4px 10px -2px rgba(0,0,0,0.8),0 20px 46px -12px rgba(0,0,0,0.9)"
    : "0 4px 10px -2px rgba(0,0,0,0.06),0 26px 54px -18px rgba(0,0,0,0.08)";
  const accentStart = isDarkMode ? "#10b981" : "#3ecf8e";
  const accentEnd = isDarkMode ? "#059669" : "#10b981";

  const [formData, setFormData] = useState({
    // Basic event details
    summary: emailData?.subject || "",
    description: emailData?.summary || "",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,

    // Recurrence
    recurrence: {
      enabled: false,
      frequency: "WEEKLY", // DAILY, WEEKLY, MONTHLY, YEARLY
      count: 10,
      interval: 1,
    },

    // Attendees
    attendees: [],

    // Reminders
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },

    // Conference data
    conferenceData: {
      enabled: false,
      type: "hangoutsMeet",
    },
  });

  // Set default date and time when modal opens
  useEffect(() => {
    if (isOpen && !formData.startDate) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      // Set end time 1 hour after start time
      const endTime = new Date(now.getTime() + 60 * 60 * 1000)
        .toTimeString()
        .slice(0, 5);

      setFormData((prev) => ({
        ...prev,
        startDate: today,
        startTime: currentTime,
        endDate: today,
        endTime: endTime,
        summary: emailData?.subject || "",
        description: emailData?.summary || "",
      }));
    }
  }, [isOpen, emailData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const addAttendee = () => {
    if (attendeeInput && attendeeInput.includes("@")) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, { email: attendeeInput.trim() }],
      }));
      setAttendeeInput("");
    }
  };

  const removeAttendee = (index) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  const updateReminder = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        overrides: prev.reminders.overrides.map((reminder, i) =>
          i === index ? { ...reminder, [field]: value } : reminder
        ),
      },
    }));
  };

  const addReminder = () => {
    setFormData((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        overrides: [
          ...prev.reminders.overrides,
          { method: "popup", minutes: 15 },
        ],
      },
    }));
  };

  const removeReminder = (index) => {
    setFormData((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        overrides: prev.reminders.overrides.filter((_, i) => i !== index),
      },
    }));
  };

  const formatEventData = () => {
    const startDateTime = formData.allDay
      ? formData.startDate
      : `${formData.startDate}T${formData.startTime}:00`;

    const endDateTime = formData.allDay
      ? formData.endDate
      : `${formData.endDate}T${formData.endTime}:00`;

    const eventData = {
      summary: formData.summary,
      location: formData.location,
      description: formData.description,
      start: formData.allDay
        ? { date: formData.startDate }
        : {
            dateTime: startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
      end: formData.allDay
        ? { date: formData.endDate }
        : {
            dateTime: endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
      attendees: formData.attendees,
      reminders: formData.reminders,
    };

    // Add recurrence if enabled
    if (formData.recurrence.enabled) {
      eventData.recurrence = [
        `RRULE:FREQ=${formData.recurrence.frequency};COUNT=${formData.recurrence.count};INTERVAL=${formData.recurrence.interval}`,
      ];
    }

    // Add conference data if enabled
    if (formData.conferenceData.enabled) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: { type: formData.conferenceData.type },
        },
      };
    }

    return eventData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = formatEventData();
      await onCreateEvent(eventData);
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 "
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleClose}
      >
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: baseBg,
            boxShadow: subtleShadow,
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header */}
          <div
            className="relative p-6 pb-4 overflow-hidden"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${accentStart}, ${accentEnd})`,
              }}
            />
            <div className="flex items-center justify-between">
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Create Calendar Event
              </h2>
              <button
                onClick={handleClose}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
                disabled={isLoading}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Event Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                          : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                      } focus:outline-none focus:scale-[1.02]`}
                      placeholder="Enter event title"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                          : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                      } focus:outline-none focus:scale-[1.02]`}
                      placeholder="Enter location or meeting link"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 resize-none ${
                        isDarkMode
                          ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                          : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                      } focus:outline-none focus:scale-[1.02]`}
                      placeholder="Enter event description"
                    />
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex items-center space-x-3">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      All Day Event
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          allDay: !prev.allDay,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.allDay
                          ? "bg-emerald-600"
                          : isDarkMode
                          ? "bg-gray-700"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.allDay ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Start Date
                      </label>
                      <CustomDateTimePicker
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 pr-12 rounded-xl border-0 text-sm transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                            : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                        } focus:outline-none focus:scale-[1.02]`}
                      />
                    </div>

                    {!formData.allDay && (
                      <div className="space-y-2">
                        <label
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Start Time
                        </label>
                        <CustomDateTimePicker
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required={!formData.allDay}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-0 text-sm transition-all duration-200 ${
                            isDarkMode
                              ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                              : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                          } focus:outline-none focus:scale-[1.02]`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        End Date
                      </label>
                      <CustomDateTimePicker
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border-0 text-sm transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                            : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                        } focus:outline-none focus:scale-[1.02]`}
                      />
                    </div>

                    {!formData.allDay && (
                      <div className="space-y-2">
                        <label
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          End Time
                        </label>
                        <CustomDateTimePicker
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required={!formData.allDay}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-0 text-sm transition-all duration-200 ${
                            isDarkMode
                              ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                              : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                          } focus:outline-none focus:scale-[1.02]`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Recurrence */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <label
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Repeat Event
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: {
                              ...prev.recurrence,
                              enabled: !prev.recurrence.enabled,
                            },
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          formData.recurrence.enabled
                            ? "bg-emerald-600"
                            : isDarkMode
                            ? "bg-gray-700"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.recurrence.enabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {formData.recurrence.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Frequency
                          </label>
                          <select
                            name="recurrence.frequency"
                            value={formData.recurrence.frequency}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                              isDarkMode
                                ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                                : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                            } focus:outline-none`}
                          >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Count
                          </label>
                          <input
                            type="number"
                            name="recurrence.count"
                            value={formData.recurrence.count}
                            onChange={handleInputChange}
                            min="1"
                            max="999"
                            className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                              isDarkMode
                                ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                                : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                            } focus:outline-none`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conference Data */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <label
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Add Video Conference
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            conferenceData: {
                              ...prev.conferenceData,
                              enabled: !prev.conferenceData.enabled,
                            },
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          formData.conferenceData.enabled
                            ? "bg-emerald-600"
                            : isDarkMode
                            ? "bg-gray-700"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.conferenceData.enabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {formData.conferenceData.enabled && (
                      <div className="space-y-2">
                        <label
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Conference Type
                        </label>
                        <select
                          name="conferenceData.type"
                          value={formData.conferenceData.type}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                            isDarkMode
                              ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                              : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                          } focus:outline-none`}
                        >
                          <option value="hangoutsMeet">Google Meet</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Attendees */}
                  <div className="space-y-4">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Attendees
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={attendeeInput}
                        onChange={(e) => setAttendeeInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addAttendee())
                        }
                        placeholder="Enter email address"
                        className={`flex-1 px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                            : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                        } focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={addAttendee}
                        className={`px-4 py-3 text-white rounded-xl transition-all duration-300 ${
                          isDarkMode
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        }`}
                      >
                        Add
                      </button>
                    </div>

                    {formData.attendees.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {formData.attendees.map((attendee, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            }`}
                          >
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {attendee.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttendee(index)}
                              className={`text-red-500 hover:text-red-700 transition-colors`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reminders */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Reminders
                      </label>
                      <button
                        type="button"
                        onClick={addReminder}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        + Add Reminder
                      </button>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {formData.reminders.overrides.map((reminder, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                          }`}
                        >
                          <select
                            value={reminder.method}
                            onChange={(e) =>
                              updateReminder(index, "method", e.target.value)
                            }
                            className={`px-3 py-2 rounded-lg border-0 text-sm ${
                              isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-white text-gray-900"
                            }`}
                          >
                            <option value="email">Email</option>
                            <option value="popup">Popup</option>
                          </select>
                          <input
                            type="number"
                            value={reminder.minutes}
                            onChange={(e) =>
                              updateReminder(
                                index,
                                "minutes",
                                parseInt(e.target.value)
                              )
                            }
                            className={`flex-1 px-3 py-2 rounded-lg border-0 text-sm ${
                              isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-white text-gray-900"
                            }`}
                            min="0"
                          />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            min before
                          </span>
                          <button
                            type="button"
                            onClick={() => removeReminder(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 flex justify-end space-x-3`}
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !formData.summary || !formData.startDate}
              className={`px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 ${
                isLoading || !formData.summary || !formData.startDate
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-[1.02] active:scale-[0.98] hover:shadow-emerald-500/25"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-emerald-500/25"
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ComprehensiveEventModal;
