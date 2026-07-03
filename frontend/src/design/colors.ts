/**
 * Aether Design System — Color Tokens
 * Source of truth for all color values in the application.
 */

export const colors = {
  primary: {
    DEFAULT: "#6366f1",
    50: "#f0f4ff",
    100: "#e0e9ff",
    200: "#c7d6fe",
    300: "#a4b8fc",
    400: "#8093f8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },

  secondary: {
    DEFAULT: "#64748b",
    light: "#94a3b8",
    dark: "#475569",
  },

  accent: {
    DEFAULT: "#8b5cf6",
    light: "#a78bfa",
    dark: "#7c3aed",
  },

  success: {
    DEFAULT: "#34d399",
    light: "#6ee7b7",
    dark: "#059669",
    muted: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.25)",
  },

  warning: {
    DEFAULT: "#fbbf24",
    light: "#fcd34d",
    dark: "#d97706",
    muted: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.25)",
  },

  danger: {
    DEFAULT: "#f87171",
    light: "#fca5a5",
    dark: "#dc2626",
    muted: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.25)",
  },

  info: {
    DEFAULT: "#60a5fa",
    light: "#93c5fd",
    dark: "#2563eb",
    muted: "rgba(96, 165, 250, 0.12)",
    border: "rgba(96, 165, 250, 0.25)",
  },

  background: {
    DEFAULT: "#0a0a0f",
    subtle: "#06060a",
  },

  surface: {
    DEFAULT: "#111118",
    raised: "#16161f",
    elevated: "#1a1a24",
    overlay: "rgba(10, 10, 15, 0.85)",
  },

  glass: {
    DEFAULT: "rgba(255, 255, 255, 0.03)",
    medium: "rgba(255, 255, 255, 0.06)",
    strong: "rgba(255, 255, 255, 0.09)",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
  },

  card: {
    DEFAULT: "#16161f",
    hover: "#1c1c28",
    active: "#222230",
  },

  border: {
    DEFAULT: "rgba(255, 255, 255, 0.08)",
    strong: "rgba(255, 255, 255, 0.14)",
    focus: "rgba(99, 102, 241, 0.45)",
  },

  text: {
    primary: "#ffffff",
    secondary: "#9ca3af",
    muted: "#6b7280",
    disabled: "#4b5563",
    inverse: "#0a0a0f",
  },

  sidebar: {
    bg: "#0d0d14",
    border: "rgba(255, 255, 255, 0.06)",
    active: "rgba(99, 102, 241, 0.12)",
    hover: "rgba(255, 255, 255, 0.04)",
  },

  interactive: {
    hover: "rgba(255, 255, 255, 0.05)",
    active: "rgba(255, 255, 255, 0.08)",
    focusRing: "rgba(99, 102, 241, 0.5)",
  },

  domain: {
    ai: {
      DEFAULT: "#8b5cf6",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
      muted: "rgba(139, 92, 246, 0.15)",
    },
    security: {
      DEFAULT: "#f97316",
      gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      muted: "rgba(249, 115, 22, 0.15)",
    },
    analytics: {
      DEFAULT: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      muted: "rgba(239, 68, 68, 0.15)",
    },
    knowledge: {
      DEFAULT: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      muted: "rgba(236, 72, 153, 0.15)",
    },
    chat: {
      DEFAULT: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      muted: "rgba(59, 130, 246, 0.15)",
    },
    task: {
      DEFAULT: "#22c55e",
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      muted: "rgba(34, 197, 94, 0.15)",
    },
    notification: {
      DEFAULT: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      muted: "rgba(245, 158, 11, 0.15)",
    },
  },

  gradients: {
    primary: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    primarySoft: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
    glow: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent)",
    text: "linear-gradient(90deg, #ffffff 0%, #c7d6fe 50%, #8093f8 100%)",
  },

  overlay: {
    light: "rgba(255, 255, 255, 0.04)",
    medium: "rgba(255, 255, 255, 0.08)",
    heavy: "rgba(0, 0, 0, 0.6)",
    scrim: "rgba(0, 0, 0, 0.75)",
  },
} as const;

export type DesignColors = typeof colors;
