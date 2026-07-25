import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/cn"

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-sidebar-hover",
        className
      )}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
