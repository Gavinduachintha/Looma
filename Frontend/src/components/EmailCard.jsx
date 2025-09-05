import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmailCard = ({ email, subject, summary, date }) => {
  const [expanded, setExpanded] = useState(false);

  // Generate random colors for this card instance
  const colorPalettes = [
    {
      hover: { bg: "#fef3f2", border: "#f87171", shadow: "rgba(248, 113, 113, 0.15)", text: "#dc2626" },
      expand: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c" }
    },
    {
      hover: { bg: "#f0fdf4", border: "#4ade80", shadow: "rgba(74, 222, 128, 0.15)", text: "#16a34a" },
      expand: { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" }
    },
    {
      hover: { bg: "#fefbeb", border: "#facc15", shadow: "rgba(250, 204, 21, 0.15)", text: "#ca8a04" },
      expand: { bg: "#fefce8", border: "#eab308", text: "#a16207" }
    },
    {
      hover: { bg: "#f0f9ff", border: "#3b82f6", shadow: "rgba(59, 130, 246, 0.15)", text: "#2563eb" },
      expand: { bg: "#eff6ff", border: "#2563eb", text: "#1d4ed8" }
    },
    {
      hover: { bg: "#fdf4ff", border: "#a855f7", shadow: "rgba(168, 85, 247, 0.15)", text: "#9333ea" },
      expand: { bg: "#faf5ff", border: "#9333ea", text: "#7c3aed" }
    },
    {
      hover: { bg: "#ecfdf5", border: "#10b981", shadow: "rgba(16, 185, 129, 0.15)", text: "#059669" },
      expand: { bg: "#f0fdf4", border: "#059669", text: "#047857" }
    },
    {
      hover: { bg: "#fff7ed", border: "#f97316", shadow: "rgba(249, 115, 22, 0.15)", text: "#ea580c" },
      expand: { bg: "#fff7ed", border: "#ea580c", text: "#c2410c" }
    },
    {
      hover: { bg: "#f3f4f6", border: "#6b7280", shadow: "rgba(107, 114, 128, 0.15)", text: "#4b5563" },
      expand: { bg: "#f9fafb", border: "#4b5563", text: "#374151" }
    }
  ];

  // Use email as seed for consistent random color per card
  const getRandomColor = () => {
    const seed = email ? email.length + subject.length : Math.random();
    const index = Math.floor(seed * colorPalettes.length) % colorPalettes.length;
    return colorPalettes[index];
  };

  const cardColors = getRandomColor();

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
            className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Parse summary for bullet points
  const bulletPoints = summary
    ? summary
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith("- "))
        .map((line) => line.replace(/^-\s*/, ""))
    : [];

  // Remove events array if present in summary
  const summaryWithoutEvents = summary
    ? summary.replace(/Events:\s*\[.*?\]/gs, "").trim()
    : "";

  // Animation variants for modal
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 100,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: { 
        duration: 0.25,
        ease: "easeIn"
      }
    }
  };

  const cardVariants = {
    initial: { 
      scale: 1,
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb"
    },
    tap: { 
      scale: 0.95,
      backgroundColor: "#f8fafc"
    },
    hover: { 
      scale: 1.02,
      y: -2,
      backgroundColor: cardColors.hover.bg,
      borderColor: cardColors.hover.border,
      boxShadow: `0 10px 30px ${cardColors.hover.shadow}`,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    expanding: {
      backgroundColor: cardColors.expand.bg,
      borderColor: cardColors.expand.border,
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  return (
    <>
      <motion.div
        className="group max-w-xs mx-auto rounded-xl shadow-lg overflow-hidden flex flex-col items-start p-4 border cursor-pointer"
        variants={cardVariants}
        initial="initial"
        whileHover={!expanded ? "hover" : "expanding"}
        whileTap={!expanded ? "tap" : undefined}
        animate={expanded ? "expanding" : "initial"}
        onClick={() => setExpanded(true)}
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb"
        }}
      >
        <div className="w-full mb-2">
          <p className="text-base font-semibold text-gray-800">Sender Name</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">{subject}</p>
        <div className="relative h-10 overflow-hidden w-full">
          {bulletPoints.length > 0 ? (
            <ul className="text-xs text-gray-600 list-disc pl-4 pr-6">
              {bulletPoints.slice(0, 2).map((point, idx) => (
                <li key={idx} className="truncate">
                  {linkify(point)}
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="text-xs text-gray-600 line-clamp-2 pr-6"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
            >
              {summaryWithoutEvents}
            </p>
          )}
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="rounded-xl shadow-2xl p-8 max-w-lg w-full relative flex flex-col items-start mx-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                perspective: 1000,
                transformStyle: "preserve-3d",
                background: `linear-gradient(135deg, ${cardColors.expand.bg} 0%, #ffffff 100%)`,
                border: `1px solid ${cardColors.expand.border}`,
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              <motion.button
                className="absolute top-4 right-4 text-2xl font-bold z-10"
                onClick={() => setExpanded(false)}
                aria-label="Close"
                initial={{ 
                  opacity: 0, 
                  rotate: -90, 
                  scale: 0,
                  color: "#9ca3af"
                }}
                animate={{ 
                  opacity: 1, 
                  rotate: 0, 
                  scale: 1,
                  color: "#6b7280"
                }}
                exit={{ 
                  opacity: 0, 
                  rotate: 90, 
                  scale: 0 
                }}
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 90,
                  color: "#dc2626"
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                &times;
              </motion.button>
              
              <motion.div 
                className="w-full mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <motion.p 
                  className="text-lg font-semibold"
                  initial={{ color: "#1f2937" }}
                  animate={{ color: cardColors.expand.text }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Sender Name
                </motion.p>
                <motion.p 
                  className="text-sm"
                  initial={{ color: "#6b7280" }}
                  animate={{ color: cardColors.expand.text }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {email}
                </motion.p>
              </motion.div>
              
              <motion.p 
                className="text-base font-medium mb-4"
                initial={{ opacity: 0, y: 20, color: "#374151" }}
                animate={{ opacity: 1, y: 0, color: cardColors.expand.text }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {subject}
              </motion.p>
              
              <motion.div
                className="w-full mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {bulletPoints.length > 0 ? (
                  <ul className="text-sm text-gray-700 list-disc pl-6 space-y-2">
                    {bulletPoints.map((point, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.4 + idx * 0.1,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                      >
                        {linkify(point)}
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {linkify(summaryWithoutEvents)}
                  </p>
                )}
              </motion.div>
              
              <motion.p 
                className="text-xs text-gray-400 mt-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {date}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default EmailCard;
