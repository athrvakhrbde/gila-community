/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Aeonik",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        bg: {
          DEFAULT: "var(--color-bg)",
          alt: "var(--color-bg-alt)",
          header: "var(--color-bg-header)",
          dark: "var(--color-bg-dark)",
        },
        surface: "var(--color-glass)",
        fg: {
          DEFAULT: "var(--color-fg)",
          muted: "var(--color-fg-muted)",
          dim: "var(--color-fg-dim)",
          onDark: "var(--color-fg-on-dark)",
          "onDark-muted": "var(--color-fg-on-dark-muted)",
        },
        "light-fg": "var(--color-light-fg)",
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        brand: {
          dark: "var(--color-brand-dark)",
          accent: "var(--color-brand-accent)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          light: "var(--color-border-light)",
          onDark: "var(--color-border-on-dark)",
        },
      },
      borderRadius: {
        section: "var(--radius-section)",
        card: "var(--radius-card)",
        nav: "var(--radius-nav)",
      },
      boxShadow: {
        lift: "var(--shadow-lift)",
      },
      maxWidth: {
        site: "var(--max-width)",
      },
      transitionTimingFunction: {
        augen: "var(--ease-augen)",
        novu: "var(--ease-augen)",
      },
    },
  },
  plugins: [],
};
