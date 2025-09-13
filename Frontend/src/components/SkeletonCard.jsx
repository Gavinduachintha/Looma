import React from "react";
import { motion } from "framer-motion";

const SkeletonCard = ({ isDarkMode, compact = false }) => {
  return (
    <motion.div
      className={`w-full border flex flex-col gap-3 animate-pulse ${
        compact
          ? "rounded-xl p-4 min-h-[120px]"
          : "rounded-2xl p-6 min-h-[200px]"
      } ${
        isDarkMode
          ? "bg-neutral-900/60 border-white/10"
          : "bg-white border-gray-200"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`h-4 ${compact ? "w-16" : "w-24"} rounded ${
          isDarkMode ? "bg-neutral-700" : "bg-gray-200"
        }`}
      />
      <div
        className={`h-3 ${compact ? "w-28" : "w-40"} rounded ${
          isDarkMode ? "bg-neutral-800" : "bg-gray-200/80"
        }`}
      />
      <div className="flex flex-col gap-2 mt-2">
        <div
          className={`h-2.5 w-full rounded ${
            isDarkMode ? "bg-neutral-800" : "bg-gray-200/80"
          }`}
        />
        <div
          className={`h-2.5 ${compact ? "w-3/4" : "w-5/6"} rounded ${
            isDarkMode ? "bg-neutral-800" : "bg-gray-200/80"
          }`}
        />
      </div>
      <div
        className={`mt-auto h-3 ${compact ? "w-12" : "w-16"} rounded ${
          isDarkMode ? "bg-neutral-800" : "bg-gray-200/80"
        }`}
      />
    </motion.div>
  );
};

export default SkeletonCard;
