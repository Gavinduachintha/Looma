import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import CustomDateTimePicker from "./CustomDateTimePicker";

const EventModal = ({ isOpen, onClose, emailData, onCreateEvent }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    allDay: false,
  });

  // Theme tokens to match app UI
  const baseBg = isDarkMode ? "#171717" : "rgba(255,255,255,0.95)";
  const borderColor = isDarkMode ? "#262626" : "rgba(60, 207, 142, 0.12)";
  const subtleShadow = isDarkMode
    ? "0 4px 10px -2px rgba(0,0,0,0.8),0 20px 46px -12px rgba(0,0,0,0.9)"
    : "0 4px 10px -2px rgba(0,0,0,0.06),0 26px 54px -18px rgba(0,0,0,0.08)";
  const accentStart = isDarkMode ? "#10b981" : "#3ecf8e";
  const accentEnd = isDarkMode ? "#059669" : "#10b981";

  // Auto-fill form data when modal opens with email data
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      // Calculate end time (1 hour after start time)
      const endTime = new Date(now.getTime() + 60 * 60 * 1000)
        .toTimeString()
        .slice(0, 5);

      setFormData({
        title: emailData?.subject || "",
        description: emailData?.summary || "",
        startDate: today,
        startTime: currentTime,
        endDate: today,
        endTime: endTime,
        location: "",
        allDay: false,
      });
    }
  }, [isOpen, emailData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        summary: formData.title,
        description: formData.description,
        location: formData.location,
        start: formData.allDay
          ? { date: formData.startDate }
          : {
              dateTime: `${formData.startDate}T${formData.startTime}:00`,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        end: formData.allDay
          ? { date: formData.endDate || formData.startDate }
          : {
              dateTime: `${formData.endDate || formData.startDate}T${
                formData.endTime
              }:00`,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
      };

      await onCreateEvent(eventData);
      handleClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        allDay: false,
      });
      onClose();
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: baseBg,
            boxShadow: subtleShadow,
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header with gradient accent */}
          <div
            className="relative p-6 pb-4"
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
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
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

          {/* Form - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Event Title */}
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
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                          : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                      } focus:outline-none focus:scale-[1.02]`}
                      placeholder="What's this event about?"
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
                      className={`w-full px-4 py-3 rounded-xl border-0 text-sm resize-none transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                          : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                      } focus:outline-none focus:scale-[1.01]`}
                      placeholder="Add event details..."
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
                      placeholder="Where is this happening?"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
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
                        Start Date *
                      </label>
                      <CustomDateTimePicker
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={today}
                        required
                        className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
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
                          Start Time *
                        </label>
                        <CustomDateTimePicker
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required={!formData.allDay}
                          className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
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
                        min={formData.startDate || today}
                        className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
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
                          className={`w-full px-4 py-3 rounded-xl border-0 text-sm transition-all duration-200 ${
                            isDarkMode
                              ? "bg-gray-800/50 text-white focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50"
                              : "bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                          } focus:outline-none focus:scale-[1.02]`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex gap-3 pt-6 mt-6 border-t"
                style={{ borderColor: borderColor }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
  type="submit"
  disabled={isLoading || !formData.title.trim()}
  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg ${
    isLoading || !formData.title.trim()
      ? "bg-gray-400 cursor-not-allowed"
      : isDarkMode
      ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/25"
      : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25"
  }`}
>
                  {isLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
