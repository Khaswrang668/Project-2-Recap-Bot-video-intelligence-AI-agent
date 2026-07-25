import { useEffect, useRef, useState } from "react"
import { UploadCloud, X, FileVideo, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useChat } from "@/context/ChatContext"
import { cn } from "@/lib/cn"

const MAX_MB = 500

export function VideoUploadModal({ open, onClose, onComplete }) {
  const { uploadAndStartChat } = useChat()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState(null) // { stage, progress, message }
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const reset = () => {
    setFile(null)
    setStatus(null)
    setBusy(false)
    setDragging(false)
    abortRef.current = null
  }

  // Reset internal state whenever the modal is opened.
  useEffect(() => {
    if (open) reset()
  }, [open])

  // Close on Escape (only when not actively uploading).
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, busy, onClose])

  if (!open) return null

  const pickFile = (f) => {
    if (!f) return
    if (!f.type.startsWith("video/")) {
      setStatus({ stage: "error", message: "Please choose a video file." })
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setStatus({ stage: "error", message: `File is too large (max ${MAX_MB}MB).` })
      return
    }
    setStatus(null)
    setFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const start = async () => {
    if (!file) return
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const boxId = await uploadAndStartChat(
        file,
        (s) => setStatus(s),
        controller.signal
      )
      onComplete?.(boxId)
    } catch {
      setBusy(false)
    }
  }

  const cancel = () => {
    abortRef.current?.abort()
    setBusy(false)
    setStatus(null)
  }

  const isUploading = status?.stage === "uploading"
  const isProcessing = status?.stage === "processing" || status?.stage === "initializing"
  const pct = Math.round((status?.progress || 0) * 100)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      <div className="animate-fade-in-up relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="upload-title" className="text-lg font-semibold text-foreground">
              Upload a video
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll transcribe and index it so you can chat about it.
            </p>
          </div>
          {!busy && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-5">
          {!busy ? (
            <>
              {/* Dropzone */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-input hover:border-primary/60"
                )}
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud size={24} />
                </span>
                <span className="text-sm font-medium text-foreground">
                  Drag & drop a video, or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  MP4, MOV, WebM and more · up to {MAX_MB}MB
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />

              {file && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-input p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-muted text-primary">
                    <FileVideo size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {status?.stage === "error" && (
                <p className="mt-3 text-sm text-danger">{status.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={start} disabled={!file}>
                  Upload & process
                </Button>
              </div>
            </>
          ) : (
            <ProcessingState
              isUploading={isUploading}
              isProcessing={isProcessing}
              pct={pct}
              message={status?.message}
              fileName={file?.name}
              onCancel={cancel}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ProcessingState({ isUploading, isProcessing, pct, message, fileName, onCancel }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-input p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-muted text-primary">
          <FileVideo size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">{message || "Working…"}</p>
        </div>
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Uploading</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Processing spinner */}
      {isProcessing && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
          <Loader2 size={20} className="animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Processing your video…</p>
            <p className="text-xs text-muted-foreground">
              Transcribing and building a searchable index. This can take a little while.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
