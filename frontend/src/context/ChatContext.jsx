import { createContext, useCallback, useContext, useRef, useState } from "react"
import { chatApi, videoApi } from "@/services/api"
import { useToast } from "./ToastContext"

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const toast = useToast()

  const [boxes, setBoxes] = useState([]) // sidebar chat list
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [activeBoxId, setActiveBoxId] = useState(null)
  const [messages, setMessages] = useState([]) // [{ id, role, content, streaming }]
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const streamAbortRef = useRef(null)

  /* ---------------- Chat history (sidebar) ---------------- */
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await chatApi.getChatHistory()
      setBoxes(res.chatHistory || [])
    } catch (err) {
      toast.error(err.message || "Could not load chat history.")
    } finally {
      setLoadingHistory(false)
    }
  }, [toast])

  /* ---------------- Open a chat ---------------- */
  const selectChat = useCallback(
    async (boxId) => {
      if (boxId === activeBoxId) return
      setActiveBoxId(boxId)
      setMessages([])
      setLoadingMessages(true)
      try {
        const res = await chatApi.viewChat(boxId)
        // Backend returns rows of { user_query, response, created_at }.
        const flat = []
        for (const m of res.messages || []) {
          if (m.user_query != null)
            flat.push({ id: `${m.created_at}-u`, role: "user", content: m.user_query })
          if (m.response != null)
            flat.push({ id: `${m.created_at}-a`, role: "assistant", content: m.response })
        }
        setMessages(flat)
      } catch (err) {
        toast.error(err.message || "Could not load this chat.")
      } finally {
        setLoadingMessages(false)
      }
    },
    [activeBoxId, toast]
  )

  /* ---------------- Send a message (streamed) ---------------- */
  const sendMessage = useCallback(
    async (text) => {
      const content = text.trim()
      if (!content || !activeBoxId || sending) return

      const userMsg = { id: `u-${Date.now()}`, role: "user", content }
      const aiId = `a-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: aiId, role: "assistant", content: "", streaming: true },
      ])
      setSending(true)

      const controller = new AbortController()
      streamAbortRef.current = controller

      try {
        await chatApi.streamResponse(activeBoxId, content, {
          signal: controller.signal,
          onToken: (chunk) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiId ? { ...m, content: m.content + chunk } : m))
            )
          },
        })
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content: m.content || "Sorry, I couldn't generate a response.",
                }
              : m
          )
        )
        toast.error(err.message || "The AI response failed.")
      } finally {
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))
        setSending(false)
        streamAbortRef.current = null
      }
    },
    [activeBoxId, sending, toast]
  )

  const stopStreaming = useCallback(() => {
    streamAbortRef.current?.abort()
  }, [])

  /* ---------------- Upload + process a video, then start a chat ---------------- */
  /**
   * onStatus receives progress updates:
   *  { stage: "requesting" | "uploading" | "processing" | "initializing" | "done" | "error",
   *    progress?: 0..1, message?: string }
   */
  const uploadAndStartChat = useCallback(
    async (file, onStatus, signal) => {
      try {
        onStatus?.({ stage: "requesting", message: "Preparing upload…" })
        const idRes = await videoApi.getVideoId()
        const videoId = idRes.videoId
        if (!videoId) throw new Error("Backend did not return a video id.")

        onStatus?.({ stage: "uploading", progress: 0, message: "Uploading video…" })
        await videoApi.processVideo(videoId, file, {
          signal,
          onUploadProgress: (p) => {
            if (p < 1) onStatus?.({ stage: "uploading", progress: p, message: "Uploading video…" })
            else
              onStatus?.({
                stage: "processing",
                message: "Processing your video — transcribing & embedding…",
              })
          },
        })

        onStatus?.({ stage: "initializing", message: "Starting your chat…" })
        const initRes = await chatApi.initializeChat(videoId)
        const boxId = initRes.body

        await loadHistory()
        onStatus?.({ stage: "done", boxId })
        toast.success("Video ready — chat started!")
        return boxId
      } catch (err) {
        onStatus?.({ stage: "error", message: err.message })
        if (err.message && !/cancel/i.test(err.message)) toast.error(err.message)
        throw err
      }
    },
    [loadHistory, toast]
  )

  /* ---------------- Delete a chat ---------------- */
  // TODO: The backend delete endpoint is not implemented yet. For now we only
  // remove the chat from local state. Wire this up to a real DELETE call
  // (e.g. chatApi.deleteChat(boxId)) once the endpoint exists.
  const deleteChat = useCallback(
    (boxId) => {
      // deleteChat() stub — replace with real API call when available.
      setBoxes((prev) => prev.filter((b) => b.boxId !== boxId))
      if (activeBoxId === boxId) {
        setActiveBoxId(null)
        setMessages([])
      }
      toast.info("Chat removed. (Backend delete is not wired up yet.)")
    },
    [activeBoxId, toast]
  )

  const resetActive = useCallback(() => {
    setActiveBoxId(null)
    setMessages([])
  }, [])

  const value = {
    boxes,
    loadingHistory,
    loadHistory,
    activeBoxId,
    messages,
    loadingMessages,
    sending,
    selectChat,
    sendMessage,
    stopStreaming,
    uploadAndStartChat,
    deleteChat,
    resetActive,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within a ChatProvider")
  return ctx
}
