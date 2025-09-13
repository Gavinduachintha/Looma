import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const CustomDateTimePicker = ({
  type = "date",
  value,
  onChange,
  min,
  required = false,
  name,
  className = "",
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || "");
  const [selectedTime, setSelectedTime] = useState(value || "");
  const containerRef = useRef(null);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === displayMonth;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected =
        currentDate.toISOString().split("T")[0] === selectedDate;
      const isPast = min && currentDate < new Date(min);

      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
      });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    onChange({ target: { name, value: dateStr } });
    setIsOpen(false);
  };

  const handleTimeChange = (timeStr) => {
    setSelectedTime(timeStr);
    onChange({ target: { name, value: timeStr } });
    setIsOpen(false);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = formatTime(timeStr);
        times.push({ value: timeStr, display: displayTime });
      }
    }
    return times;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (type === "date") {
    return (
      <div ref={containerRef} className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`${className} cursor-pointer flex items-center justify-between`}
        >
          <span className={selectedDate ? "" : "opacity-50"}>
            {selectedDate ? formatDate(selectedDate) : "Select date"}
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`fixed z-[9999] p-4 rounded-xl shadow-2xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: isDarkMode
                  ? "linear-gradient(135deg, #374151 0%, #1f2937 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                minWidth: "280px",
              }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (displayMonth === 0) {
                      setDisplayMonth(11);
                      setDisplayYear(displayYear - 1);
                    } else {
                      setDisplayMonth(displayMonth - 1);
                    }
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  ←
                </button>

                <div
                  className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {monthNames[displayMonth]} {displayYear}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (displayMonth === 11) {
                      setDisplayMonth(0);
                      setDisplayYear(displayYear + 1);
                    } else {
                      setDisplayMonth(displayMonth + 1);
                    }
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-medium py-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayData, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      !dayData.isPast && handleDateSelect(dayData.date)
                    }
                    disabled={dayData.isPast}
                    className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${
                      dayData.isPast
                        ? "opacity-30 cursor-not-allowed"
                        : dayData.isSelected
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold"
                        : dayData.isToday
                        ? "bg-emerald-500/20 text-emerald-600 font-semibold"
                        : dayData.isCurrentMonth
                        ? isDarkMode
                          ? "text-gray-200 hover:bg-emerald-500/10"
                          : "text-gray-800 hover:bg-emerald-500/10"
                        : isDarkMode
                        ? "text-gray-600 hover:bg-emerald-500/5"
                        : "text-gray-400 hover:bg-emerald-500/5"
                    }`}
                  >
                    {dayData.day}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (type === "time") {
    return (
      <div ref={containerRef} className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`${className} cursor-pointer flex items-center justify-between`}
        >
          <span className={selectedTime ? "" : "opacity-50"}>
            {selectedTime ? formatTime(selectedTime) : "Select time"}
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`fixed z-[9999] p-2 rounded-xl shadow-2xl border max-h-48 overflow-y-auto custom-scrollbar ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 custom-scrollbar-dark"
                  : "bg-white border-gray-200 custom-scrollbar-light"
              }`}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: isDarkMode
                  ? "linear-gradient(135deg, #374151 0%, #1f2937 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                minWidth: "160px",
              }}
            >
              {generateTimeOptions().map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleTimeChange(time.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTime === time.value
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold"
                      : isDarkMode
                      ? "text-gray-200 hover:bg-emerald-500/10"
                      : "text-gray-800 hover:bg-emerald-500/10"
                  }`}
                >
                  {time.display}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default CustomDateTimePicker;
