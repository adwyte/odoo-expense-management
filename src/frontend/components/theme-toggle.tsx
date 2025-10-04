"use client"

import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 border border-border rounded bg-bg text-fg text-sm"
      style={{ borderRadius: "3px" }}
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  )
}
