import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const to = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-pressed={theme === "dark"}
      aria-label={`Switch to ${to} mode`}
      title={`Switch to ${to} mode`}
      onClick={toggle}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-subtle bg-[color:var(--bg)]/60 backdrop-blur-xl hover:bg-[color:var(--bg)]/70 transition focus-ring"
    >
      <span className="sr-only">Toggle theme</span>

      <span className="flex items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {theme !== "dark" ? (
            <motion.svg
              key="sun"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-[color:var(--text)] group-hover:text-[color:var(--accent)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0.75, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.75, rotate: 90 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </motion.svg>
          ) : (
            <motion.svg
              key="moon"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-[color:var(--text)] group-hover:text-[color:var(--accent)]"
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.75, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.75, rotate: -90 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
};
