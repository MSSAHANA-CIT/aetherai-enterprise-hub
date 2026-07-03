/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Legacy aether palette (backward compatible) */
        aether: {
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
        surface: {
          DEFAULT: "#0a0a0f",
          raised: "#12121a",
          card: "#16161f",
          border: "#1f1f2e",
        },
        /* Design System tokens — prefix: ds- */
        ds: {
          primary: {
            DEFAULT: "#6366f1",
            300: "#a4b8fc",
            400: "#8093f8",
            500: "#6366f1",
            600: "#4f46e5",
          },
          accent: {
            DEFAULT: "#8b5cf6",
            light: "#a78bfa",
          },
          secondary: "#64748b",
          success: {
            DEFAULT: "#34d399",
            muted: "rgba(52, 211, 153, 0.12)",
            border: "rgba(52, 211, 153, 0.25)",
          },
          warning: {
            DEFAULT: "#fbbf24",
            muted: "rgba(251, 191, 36, 0.12)",
            border: "rgba(251, 191, 36, 0.25)",
          },
          danger: {
            DEFAULT: "#f87171",
            muted: "rgba(248, 113, 113, 0.12)",
            border: "rgba(248, 113, 113, 0.25)",
          },
          info: {
            DEFAULT: "#60a5fa",
            muted: "rgba(96, 165, 250, 0.12)",
            border: "rgba(96, 165, 250, 0.25)",
          },
          canvas: "#0a0a0f",
          surface: {
            DEFAULT: "#111118",
            raised: "#16161f",
          },
          card: {
            DEFAULT: "#16161f",
            hover: "#1c1c28",
          },
          glass: {
            DEFAULT: "rgba(255, 255, 255, 0.03)",
            medium: "rgba(255, 255, 255, 0.06)",
            strong: "rgba(255, 255, 255, 0.09)",
            border: "rgba(255, 255, 255, 0.08)",
            "border-strong": "rgba(255, 255, 255, 0.14)",
          },
          border: {
            DEFAULT: "rgba(255, 255, 255, 0.08)",
            strong: "rgba(255, 255, 255, 0.14)",
          },
          focus: "rgba(99, 102, 241, 0.45)",
          hover: "rgba(255, 255, 255, 0.05)",
          scrim: "rgba(0, 0, 0, 0.75)",
          text: {
            primary: "#ffffff",
            secondary: "#9ca3af",
            muted: "#6b7280",
          },
          sidebar: {
            DEFAULT: "#0d0d14",
            border: "rgba(255, 255, 255, 0.06)",
            active: "rgba(99, 102, 241, 0.12)",
            hover: "rgba(255, 255, 255, 0.04)",
          },
          ai: {
            DEFAULT: "#8b5cf6",
            muted: "rgba(139, 92, 246, 0.15)",
          },
          security: {
            DEFAULT: "#f97316",
            muted: "rgba(249, 115, 22, 0.15)",
          },
          analytics: {
            DEFAULT: "#ef4444",
            muted: "rgba(239, 68, 68, 0.15)",
          },
          knowledge: {
            DEFAULT: "#ec4899",
            muted: "rgba(236, 72, 153, 0.15)",
          },
          chat: {
            DEFAULT: "#3b82f6",
            muted: "rgba(59, 130, 246, 0.15)",
          },
          task: {
            DEFAULT: "#22c55e",
            muted: "rgba(34, 197, 94, 0.15)",
          },
          notification: {
            DEFAULT: "#f59e0b",
            muted: "rgba(245, 158, 11, 0.15)",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "Consolas", "monospace"],
      },
      fontSize: {
        "ds-label": ["0.8125rem", { lineHeight: "1", fontWeight: "500", letterSpacing: "0.025em" }],
        "ds-caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.025em" }],
        "ds-body": ["0.875rem", { lineHeight: "1.625" }],
        "ds-subheading": ["1.125rem", { lineHeight: "1.375", fontWeight: "500" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent)",
        "ds-gradient-primary": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        "ds-gradient-ai": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(99, 102, 241, 0.4)",
        "glow-sm": "0 0 20px -5px rgba(99, 102, 241, 0.3)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
        "ds-soft": "0 2px 8px -2px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)",
        "ds-medium": "0 4px 16px -4px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)",
        "ds-strong": "0 8px 32px -8px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
        "ds-glass": "0 4px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "ds-hover": "0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        "ds-floating": "0 12px 40px -10px rgba(0, 0, 0, 0.55), 0 0 20px -5px rgba(99, 102, 241, 0.15)",
        "ds-modal": "0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        "ds-glow": "0 0 40px -10px rgba(99, 102, 241, 0.35)",
        "ds-glow-sm": "0 0 20px -5px rgba(99, 102, 241, 0.25)",
      },
      borderRadius: {
        "ds-sm": "0.375rem",
        "ds-md": "0.5rem",
        "ds-lg": "0.75rem",
        "ds-xl": "1rem",
        "ds-2xl": "1.25rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
