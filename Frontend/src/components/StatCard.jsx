import React, { useState } from "react";
import { motion } from "framer-motion";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  onClick,
  loading = false,
  size = "default", // 'default' | 'small'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = size === "small" ? "p-4 rounded-xl" : "p-6 rounded-2xl";

  const iconSizeClasses = size === "small" ? "w-8 h-8" : "w-10 h-10";

  const valueSizeClasses =
    size === "small" ? "text-lg font-semibold" : "text-2xl font-bold";

  const titleSizeClasses = size === "small" ? "text-xs" : "text-sm";

  return (
    <motion.div
      className={`backdrop-blur-xl border cursor-pointer transition-all duration-300 ${sizeClasses}`}
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center ${
          size === "small" ? "gap-3" : "justify-between"
        }`}
      >
        <div className="flex items-center">
          <motion.div
            className={`${iconSizeClasses} rounded-xl flex items-center justify-center`}
            style={{ backgroundColor: color }}
            animate={{
              rotate: isHovered ? 5 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              className={`${
                size === "small" ? "w-4 h-4" : "w-5 h-5"
              } text-white`}
            />
          </motion.div>

          <div className={size === "small" ? "ml-0" : "ml-4"}>
            <p className={`${titleSizeClasses} font-medium text-gray-400`}>
              {title}
            </p>
            <div className="flex items-center gap-2">
              <motion.p
                className={`${valueSizeClasses} text-white`}
                animate={{ scale: loading ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
              >
                {loading ? "..." : value}
              </motion.p>
              {subtitle && (
                <span className="text-xs text-gray-500">{subtitle}</span>
              )}
            </div>
          </div>
        </div>

        {/* Trend indicator (only for default size) */}
        {size === "default" && trend && (
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              trend.type === "up"
                ? "bg-green-900/30 text-green-400"
                : trend.type === "down"
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-900/30 text-gray-400"
            }`}
          >
            {trend.value}
          </div>
        )}
      </div>

      {/* Progress bar for percentage values */}
      {typeof value === "string" &&
        value.includes("%") &&
        size === "default" && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <motion.div
                className="h-1 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${parseInt(value)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        )}
    </motion.div>
  );
};

export default StatCard;
