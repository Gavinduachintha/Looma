import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Utility for joining class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Base styles
const baseStyles =
  "relative inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:opacity-50 disabled:cursor-not-allowed select-none";

// Size classes
const sizeStyles = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-3.5 py-2",
  lg: "text-sm px-4 py-2.5",
  icon: "p-2.5",
};

// Spinner sizes
const spinnerSizes = {
  sm: 14,
  md: 16,
  lg: 18,
  icon: 18,
};

export const Button = forwardRef(
  (
    {
      as = motion.button,
      size = "md",
      className = "",
      children,
      loading = false,
      icon: Icon,
      iconPosition = "left",
      disabled,
      whileHover = { scale: 1.02 },
      whileTap = { scale: 0.97 },
      ...rest
    },
    ref
  ) => {
    const { isDarkMode } = useTheme();
    const Comp = as;

    const showIconLeft = Icon && iconPosition === "left" && !loading;
    const showIconRight = Icon && iconPosition === "right" && !loading;

    // No inline color styles here - prefer Tailwind classes via `className`.
    // Keep minimal style for motion animations when needed.
    const buttonStyle = {};
    const hoverStyle = {};

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], className)}
        disabled={disabled || loading}
        style={buttonStyle}
        whileHover={disabled || loading ? {} : whileHover}
        whileTap={disabled || loading ? {} : whileTap}
        {...rest}
      >
        {loading && (
          <Loader2
            size={spinnerSizes[size]}
            className="animate-spin opacity-80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {showIconLeft && (
          <Icon
            size={spinnerSizes[size]}
            className="shrink-0"
            aria-hidden="true"
          />
        )}
        {children && (
          <span className={loading ? "opacity-0" : "truncate"}>{children}</span>
        )}
        {showIconRight && (
          <Icon
            size={spinnerSizes[size]}
            className="shrink-0"
            aria-hidden="true"
          />
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;
