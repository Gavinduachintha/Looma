import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { GmailIcon, CalendarIcon, SecurityIcon } from "./AuthIcons";

const PermissionCard = ({
  icon: Icon,
  title,
  description,
  permissions = [],
  delay = 0,
  className = "",
}) => {
  const { isDarkMode } = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`
        relative overflow-hidden rounded-xl p-6 border transition-all duration-300
        ${
          isDarkMode
            ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
            : "bg-white border-gray-200 hover:border-gray-300"
        }
        hover:shadow-lg hover:scale-105
        ${className}
      `}
    >
      {/* Background gradient */}
      <div
        className={`
        absolute inset-0 opacity-5
        ${title === "Gmail" ? "bg-gradient-to-br from-red-500 to-red-600" : ""}
        ${
          title === "Calendar"
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : ""
        }
      `}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
          p-3 rounded-lg
          ${
            title === "Gmail"
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-blue-50 dark:bg-blue-900/20"
          }
        `}
        >
          <Icon size={24} />
        </div>
        <div>
          <h3
            className={`
            font-semibold text-lg
            ${isDarkMode ? "text-gray-100" : "text-gray-900"}
          `}
          >
            {title}
          </h3>
          <p
            className={`
            text-sm
            ${isDarkMode ? "text-gray-400" : "text-gray-600"}
          `}
          >
            Google {title}
          </p>
        </div>
      </div>

      {/* Description */}
      <p
        className={`
        text-sm mb-4 leading-relaxed
        ${isDarkMode ? "text-gray-300" : "text-gray-700"}
      `}
      >
        {description}
      </p>

      {/* Permissions List */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <SecurityIcon
            size={16}
            className={isDarkMode ? "text-green-400" : "text-green-600"}
          />
          <span
            className={`
            text-xs font-medium
            ${isDarkMode ? "text-gray-400" : "text-gray-600"}
          `}
          >
            Required Permissions:
          </span>
        </div>
        {permissions.map((permission, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className={`
              w-1.5 h-1.5 rounded-full
              ${isDarkMode ? "bg-green-400" : "bg-green-600"}
            `}
            />
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              {permission}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const PermissionCards = () => {
  const permissions = {
    gmail: [
      "Read your email messages and settings",
      "Send emails on your behalf",
      "Manage email labels and folders",
      "Access email metadata (sender, subject, date)",
    ],
    calendar: [
      "View your calendar events",
      "Create and edit calendar events",
      "Manage calendar settings",
      "Access calendar metadata",
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <PermissionCard
        icon={GmailIcon}
        title="Gmail"
        description="Access your Gmail account to manage emails, organize your inbox, and send messages directly from Looma."
        permissions={permissions.gmail}
        delay={0.1}
      />
      <PermissionCard
        icon={CalendarIcon}
        title="Calendar"
        description="Connect with Google Calendar to view upcoming events, create new appointments, and manage your schedule."
        permissions={permissions.calendar}
        delay={0.2}
      />
    </div>
  );
};

export default PermissionCards;
