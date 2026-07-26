import { useEffect, useRef } from "react"
import { Clapperboard, Sparkles } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { InputBar } from "./InputBar"
import { useChat } from "@/context/ChatContext"

const SUGGESTIONS = [
  "Summarize this video in a few bullet points",
  "What are the key takeaways?",
  "Explain the main argument in simple terms",
]

export function ChatWindow() {
  const {
    activeBoxId,
    boxes,
    messages,
    loadingMessages,
    sending,
    sendMessage,
    stopStreaming,
  } = useChat()

  const scrollRef = useRef(null)
  const bottomRef = useRef(null)

  const activeBox = boxes.find((b) => b.id === activeBoxId)

  // Auto-scroll to latest message as content streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Clapperboard size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {activeBox?.title || "Video chat"}
          </p>
          <p className="text-xs text-muted-foreground">Chatting with your video transcript</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
          {loadingMessages ? (
            <MessageSkeletons />
          ) : messages.length === 0 ? (
            <EmptyChat onPick={(t) => sendMessage(t)} />
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} streaming={m.streaming} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <InputBar onSend={sendMessage} onStop={stopStreaming} sending={sending} disabled={sending} />
    </div>
  )
}

function EmptyChat({ onPick }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles size={26} />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-foreground">Ask about your video</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Your video is processed and ready. Ask a question to get answers grounded in its
        transcript.
      </p>
      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-sidebar-hover"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageSkeletons() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 ? "flex-row-reverse" : ""}`}>
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
