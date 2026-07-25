import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

const STORAGE_KEY = "recapbot_theme"

function getInitialTheme() {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return "dark" // default to dark per design direction
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0b" : "#f7f7f8")
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
