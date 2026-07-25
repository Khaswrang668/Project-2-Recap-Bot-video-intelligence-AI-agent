import { Plus, Trash2, MessageSquare, PanelLeftClose, VideoOff } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { UserMenu } from "./UserMenu"
import { useChat } from "@/context/ChatContext"
import { cn } from "@/lib/cn"

export function Sidebar({ onNewChat, onCloseMobile, showCollapse, onCollapse }) {
  const {
    boxes,
    loadingHistory,
    activeBoxId,
    selectChat,
    deleteChat,
  } = useChat()

  const handleSelect = (boxId) => {
    selectChat(boxId)
    onCloseMobile?.()
  }

  const handleDelete = (e, boxId) => {
    e.stopPropagation()
    deleteChat(boxId)
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <Logo />
        {showCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* New chat / upload */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <Plus size={18} />
          New chat · Upload video
        </button>
      </div>

      {/* History */}
      <div className="mt-5 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent chats
        </p>

        {loadingHistory ? (
          <SidebarSkeletons />
        ) : boxes.length === 0 ? (
          <EmptyHistory />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {boxes.map((box) => (
              <li key={box.boxId}>
                <div
                  onClick={() => handleSelect(box.boxId)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    activeBoxId === box.boxId
                      ? "bg-sidebar-hover text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                  )}
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{box.title || "Untitled chat"}</span>
                  <button
                    onClick={(e) => handleDelete(e, box.boxId)}
                    aria-label={`Delete chat ${box.title || ""}`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: user menu */}
      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-muted-foreground">
        <VideoOff size={20} />
      </span>
      <p className="text-sm font-medium text-foreground">No chats yet</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Upload a video to get started.
      </p>
    </div>
  )
}

function SidebarSkeletons() {
  return (
    <div className="flex flex-col gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-sidebar-hover" />
      ))}
    </div>
  )
}
