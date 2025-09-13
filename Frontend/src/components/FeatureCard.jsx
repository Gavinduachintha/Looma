import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

/**
 * Reusable feature card used on the landing page.
 * Props: icon (ReactNode), title (string), description (string), delay (number for animation stagger)
 */
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const { isDarkMode } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-[1.03] focus-within:scale-[1.03] outline-none group ${
        isDarkMode
          ? "bg-white/5 border-white/20 hover:bg-white/10"
          : "bg-white/60 border-white/40 hover:bg-white/80 shadow-lg"
      }`}
      tabIndex={0}
      role="listitem"
      aria-label={title}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
        {icon}
      </div>
      <h3
        className={`text-xl font-semibold mb-3 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
