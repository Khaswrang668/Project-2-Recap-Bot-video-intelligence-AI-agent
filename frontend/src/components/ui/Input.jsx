import { forwardRef, useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/cn"

export const Input = forwardRef(function Input(
  { label, error, hint, type = "text", className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId
  const isPassword = type === "password"
  const [show, setShow] = useState(false)
  const resolvedType = isPassword ? (show ? "text" : "password") : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          aria-invalid={!!error}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-input px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40",
            isPassword && "pr-11",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
})
