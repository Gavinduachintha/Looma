import React from "react";
import { motion } from "framer-motion";

const DateWidget = ({ isDarkMode }) => {
  const currentDate = new Date();

  const formatMonth = () => {
    return currentDate.toLocaleDateString([], {
      month: "long",
    });
  };

  const formatFullDate = () => {
    return currentDate.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      className={`rounded-2xl backdrop-blur-xl border p-6 ${
        isDarkMode
          ? "bg-white/5 border-white/20"
          : "bg-white/60 border-white/40 shadow-lg"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="text-center">
        <h3
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {formatMonth()}
        </h3>
        <p
          className={`text-sm font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Today is {formatFullDate()}
        </p>
      </div>
    </motion.div>
  );
};

export default DateWidget;
