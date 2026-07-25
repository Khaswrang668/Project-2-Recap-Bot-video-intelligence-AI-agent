import { useEffect, useState } from "react"
import { Menu, Plus, UploadCloud, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/chat/Sidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { VideoUploadModal } from "@/components/chat/VideoUploadModal"
import { Button } from "@/components/ui/Button"
import { Logo } from "@/components/ui/Logo"
import { useChat } from "@/context/ChatContext"
import { cn } from "@/lib/cn"

export default function Dashboard() {
  const { activeBoxId, loadHistory, selectChat } = useChat()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  // Load the sidebar chat history once on mount.
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const openUpload = () => {
    setMobileOpen(false)
    setUploadOpen(true)
  }

  const onUploadComplete = (boxId) => {
    setUploadOpen(false)
    if (boxId) selectChat(boxId)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border md:block">
        <Sidebar onNewChat={openUpload} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border shadow-xl transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar
            onNewChat={openUpload}
            onCloseMobile={() => setMobileOpen(false)}
            showCollapse
            onCollapse={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      {/* Main area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-sidebar-hover"
          >
            <Menu size={20} />
          </button>
          <Logo />
          <button
            onClick={openUpload}
            aria-label="Upload video"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-sidebar-hover"
          >
            <Plus size={20} />
          </button>
        </div>

        {activeBoxId ? <ChatWindow /> : <NoChatSelected onUpload={openUpload} />}
      </main>

      <VideoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onComplete={onUploadComplete}
      />
    </div>
  )
}

function NoChatSelected({ onUpload }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles size={30} />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Welcome to Recap Bot
        </h1>
        <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
          Upload a video to get started. We&apos;ll transcribe and index it, then you can chat with
          the AI about anything in it.
        </p>
        <Button size="lg" onClick={onUpload} className="mt-6">
          <UploadCloud size={18} />
          Upload a video
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Or pick an existing chat from the sidebar.
        </p>
      </div>
    </div>
  )
}
