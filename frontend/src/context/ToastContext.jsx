import { createContext, useCallback, useContext, useRef, useState } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/cn"
import { useMemo } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )
  
  useMemo(()=>{
   const toast = {
    success: (m, d) => push(m, "success", d),
    error: (m, d) => push(m, "error", d),
    info: (m, d) => push(m, "info", d),
  }
  },[push])
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ message, type, onClose }) {
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info
  const iconColor =
    type === "success"
      ? "text-primary"
      : type === "error"
        ? "text-danger"
        : "text-muted-foreground"

  return (
    <div
      role="status"
      className={cn(
        "animate-fade-in-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", iconColor)} />
      <p className="flex-1 text-sm leading-relaxed text-foreground">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
