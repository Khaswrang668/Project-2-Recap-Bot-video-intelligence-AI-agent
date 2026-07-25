import { cn } from "@/lib/cn"
import { Loader2 } from "lucide-react"

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm disabled:opacity-60",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-sidebar-hover disabled:opacity-60",
  ghost: "text-foreground hover:bg-sidebar-hover disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-60",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-sidebar-hover disabled:opacity-60",
}

const sizes = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-lg",
}

export function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Comp>
  )
}
