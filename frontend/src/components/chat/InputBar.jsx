import { useEffect, useRef, useState } from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/cn"

export function InputBar({ onSend, onStop, disabled, sending, placeholder }) {
  const [value, setValue] = useState("")
  const textareaRef = useRef(null)

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  const onKeyDown = (e) => {
    // Respect IME composition (CJK) — don't submit mid-composition.
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 pb-4 pt-3 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border bg-input p-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30"
          )}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder || "Ask anything about your video…"}
            aria-label="Message"
            className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          {sending ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted text-foreground transition-colors hover:bg-sidebar-hover"
            >
              <Square size={16} className="fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !value.trim()}
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Recap Bot answers from your video&apos;s transcript. Press Enter to send.
        </p>
      </div>
    </div>
  )
}
