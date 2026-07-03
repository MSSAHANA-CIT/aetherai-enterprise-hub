export const theme = {
  colors: {
    background: "#0a0a0f",
    surface: "#111118",
    surfaceRaised: "#16161f",
    surfaceCard: "#1a1a24",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    textPrimary: "#ffffff",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    accent: "#6366f1",
    accentLight: "#a5b4fc",
    accentPurple: "#8b5cf6",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
  },
  gradients: {
    primary: "from-aether-500 to-purple-600",
    card: "from-aether-600/20 to-purple-600/10",
    glow: "shadow-glow-sm",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
  spacing: {
    page: "1.5rem",
    section: "1.25rem",
    card: "1rem",
  },
  typography: {
    pageTitle: "text-2xl font-semibold tracking-tight text-white",
    sectionTitle: "text-lg font-semibold text-white",
    body: "text-sm text-gray-300 leading-relaxed",
    caption: "text-xs text-gray-500",
  },
} as const;

export type Theme = typeof theme;
