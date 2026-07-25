import { Clapperboard } from "lucide-react"
import { cn } from "@/lib/cn"

export function Logo({ className, iconSize = 18, showText = true, textClassName }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Clapperboard size={iconSize} />
      </span>
      {showText && (
        <span className={cn("text-lg font-bold tracking-tight text-foreground", textClassName)}>
          Recap<span className="text-primary">Bot</span>
        </span>
      )}
    </span>
  )
}
