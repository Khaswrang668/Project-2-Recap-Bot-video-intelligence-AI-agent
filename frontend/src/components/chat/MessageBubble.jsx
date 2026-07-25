import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Clapperboard, User } from "lucide-react"
import { cn } from "@/lib/cn"

export function MessageBubble({ role, content, streaming }) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "animate-fade-in-up flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          isUser
            ? "bg-surface-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
        aria-hidden="true"
      >
        {isUser ? <User size={16} /> : <Clapperboard size={16} />}
      </span>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm md:max-w-[75%]",
          isUser
            ? "rounded-tr-sm bg-bubble-user text-bubble-user-foreground"
            : "rounded-tl-sm border border-border bg-bubble-ai text-bubble-ai-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className={cn("prose-chat", streaming && content && "streaming-caret")}>
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <TypingDots />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Assistant is typing">
      <span className="loading-dot h-2 w-2 rounded-full bg-muted-foreground" />
      <span className="loading-dot h-2 w-2 rounded-full bg-muted-foreground [animation-delay:0.2s]" />
      <span className="loading-dot h-2 w-2 rounded-full bg-muted-foreground [animation-delay:0.4s]" />
    </span>
  )
}
