// Looma Color System - Supabase Theme
// Authentic Supabase color palette with light and dark modes

export const colors = {
  // Supabase Brand Colors
  brand: {
    // Supabase Green - Primary brand color
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#3ecf8e", // Supabase signature green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Supabase Grays for backgrounds and text
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Supabase Dark Theme Colors - Exact Match from Screenshots
  dark: {
    background: "#0a0a0a", // Almost pure black like Supabase
    surface: "#171717", // Very dark gray for cards
    border: "#262626", // Subtle borders
    lighter: "#404040", // Hover states
    overlay: "#000000", // Pure black for overlays
  },

  // Semantic colors
  semantic: {
    success: "#3ecf8e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Theme configurations - Supabase style
  themes: {
    light: {
      // Backgrounds
      background: {
        primary: "#ffffff", // Pure white
        secondary: "#f9fafb", // Supabase light gray
        tertiary: "#f3f4f6", // Slightly darker gray
        surface: "#ffffff", // Card surfaces
        elevated: "#ffffff", // Elevated surfaces
      },
      // Text colors
      text: {
        primary: "#1f2937", // Dark gray for primary text
        secondary: "#4b5563", // Medium gray for secondary text
        tertiary: "#6b7280", // Light gray for tertiary text
        inverse: "#ffffff", // White text for dark backgrounds
        accent: "#3ecf8e", // Supabase green for accents
      },
      // Borders and dividers
      border: {
        primary: "#e5e7eb", // Light border
        secondary: "#d1d5db", // Slightly darker border
        accent: "#3ecf8e", // Green border for focus states
      },
      // Interactive elements
      interactive: {
        primary: "#3ecf8e", // Supabase green
        secondary: "#f3f4f6", // Light gray
        hover: "#2dd4bf", // Slightly darker green
        active: "#14b8a6", // Even darker green
      },
    },
    dark: {
      // Backgrounds - Exact Supabase Dark Theme from Screenshots
      background: {
        primary: "#0a0a0a", // Almost pure black main background
        secondary: "#171717", // Very dark surfaces
        tertiary: "#1a1a1a", // Card backgrounds
        surface: "#171717", // Card surfaces
        elevated: "#1a1a1a", // Elevated surfaces
      },
      // Text colors - High contrast like Supabase
      text: {
        primary: "#ffffff", // Pure white primary text
        secondary: "#a1a1a1", // Light gray text
        tertiary: "#666666", // Muted gray text
        inverse: "#1f2937", // Dark text for light backgrounds
        accent: "#3ecf8e", // Supabase green
      },
      // Borders and dividers - Dark like Supabase
      border: {
        primary: "#262626", // Very subtle borders
        secondary: "#333333", // Slightly lighter borders
        accent: "#3ecf8e", // Green border for focus
      },
      // Interactive elements - Dark Supabase Theme
      interactive: {
        primary: "#3ecf8e", // Supabase green
        secondary: "#1a1a1a", // Very dark interactive
        hover: "#2dd4bf", // Hover green
        active: "#14b8a6", // Active green
      },
    },
  },

  // Button variants - Supabase style
  buttons: {
    primary: {
      light: {
        background: "#3ecf8e",
        backgroundHover: "#2dd4bf",
        backgroundActive: "#14b8a6",
        text: "#ffffff",
        border: "#3ecf8e",
      },
      dark: {
        background: "#3ecf8e",
        backgroundHover: "#2dd4bf",
        backgroundActive: "#14b8a6",
        text: "#0a0a0a",
        border: "#3ecf8e",
      },
    },
    secondary: {
      light: {
        background: "#f3f4f6",
        backgroundHover: "#e5e7eb",
        backgroundActive: "#d1d5db",
        text: "#1f2937",
        border: "#e5e7eb",
      },
      dark: {
        background: "#1a1a1a",
        backgroundHover: "#262626",
        backgroundActive: "#333333",
        text: "#ffffff",
        border: "#262626",
      },
    },
    outline: {
      light: {
        background: "transparent",
        backgroundHover: "#f0fdf4",
        backgroundActive: "#dcfce7",
        text: "#3ecf8e",
        border: "#3ecf8e",
      },
      dark: {
        background: "transparent",
        backgroundHover: "rgba(62, 207, 142, 0.1)",
        backgroundActive: "rgba(62, 207, 142, 0.2)",
        text: "#3ecf8e",
        border: "#3ecf8e",
      },
    },
    ghost: {
      light: {
        background: "transparent",
        backgroundHover: "#f3f4f6",
        backgroundActive: "#e5e7eb",
        text: "#1f2937",
        border: "transparent",
      },
      dark: {
        background: "transparent",
        backgroundHover: "#1a1a1a",
        backgroundActive: "#262626",
        text: "#ffffff",
        border: "transparent",
      },
    },
  },
};

// Utility functions for theme management
export const getTheme = (isDarkMode) => {
  return isDarkMode ? colors.themes.dark : colors.themes.light;
};

export const getButtonStyles = (variant, isDarkMode) => {
  const buttonVariant = colors.buttons[variant] || colors.buttons.primary;
  return isDarkMode ? buttonVariant.dark : buttonVariant.light;
};

export const getSemanticColor = (type, isDarkMode) => {
  return colors.semantic[type];
};

// Supabase-style component styles
export const supabaseStyles = {
  card: (isDarkMode) => ({
    background: isDarkMode
      ? colors.themes.dark.background.surface
      : colors.themes.light.background.surface,
    border: `1px solid ${
      isDarkMode
        ? colors.themes.dark.border.primary
        : colors.themes.light.border.primary
    }`,
    borderRadius: "8px",
    boxShadow: isDarkMode
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  }),

  input: (isDarkMode) => ({
    background: isDarkMode
      ? colors.themes.dark.background.tertiary
      : colors.themes.light.background.primary,
    border: `1px solid ${
      isDarkMode
        ? colors.themes.dark.border.primary
        : colors.themes.light.border.primary
    }`,
    color: isDarkMode
      ? colors.themes.dark.text.primary
      : colors.themes.light.text.primary,
    borderRadius: "6px",
    focusBorderColor: colors.brand[500],
    focusRingColor: `${colors.brand[500]}40`,
  }),
};
