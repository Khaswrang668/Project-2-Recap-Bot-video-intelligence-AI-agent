import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Moon, Sun, ChevronsUpDown } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useToast } from "@/context/ToastContext"

export function UserMenu() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const initials = (user?.username || "U").slice(0, 2).toUpperCase()

  const onLogout = async () => {
    setOpen(false)
    await logout()
    toast.success("You have been logged out.")
    navigate("/login", { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.username || "User"}
            </p>
            {user?.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          <div className="p-1.5">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-sidebar-hover"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-sidebar-hover"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-sidebar-hover"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {user?.username || "User"}
          </span>
          {user?.email && (
            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          )}
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
      </button>
    </div>
  )
}
