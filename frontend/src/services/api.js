/**
 * Recap Bot API client.
 *
 * All authenticated requests send credentials (httpOnly cookies) via
 * `credentials: "include"`. The base URL and route prefixes are configurable
 * through environment variables so the same build can target any backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
const USERS_PREFIX = import.meta.env.VITE_API_USERS_PREFIX || "/api/v1/users"
const VIDEOS_PREFIX = import.meta.env.VITE_API_VIDEOS_PREFIX || "/api/v1/videos"
const CHATS_PREFIX = import.meta.env.VITE_API_CHATS_PREFIX || "/api/v1/chats"

/** Thrown for any non-ok response or `{ success: false }` payload. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message || "Something went wrong. Please try again.")
    this.name = "ApiError"
    this.status = status
  }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const isFormData = body instanceof FormData
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      signal,
      headers: {
        ...(isFormData ? {} : body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("Network error — is the backend reachable?", 0)
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok || (data && data.success === false)) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status)
  }
  return data
}

/* ------------------------------------------------------------------ */
/*  Auth — /api/v1/users                                               */
/* ------------------------------------------------------------------ */
export const authApi = {
  register({ username, email, password }) {
    return request(`${USERS_PREFIX}/user-register`, {
      method: "POST",
      body: { username, email, password },
    })
  },
  login({ identifier, password }) {
    return request(`${USERS_PREFIX}/user-login`, {
      method: "POST",
      body: { identifier, password },
    })
  },
  logout() {
    return request(`${USERS_PREFIX}/user-logout`, { method: "POST" })
  },
  refresh() {
    return request(`${USERS_PREFIX}/refresh-access-token`, { method: "POST" })
  },
}

/* ------------------------------------------------------------------ */
/*  Video — /api/v1/videos                                             */
/* ------------------------------------------------------------------ */
export const videoApi = {
  getVideoId() {
    return request(`${VIDEOS_PREFIX}/get-video-id`)
  },
  /**
   * Uploads a video file for processing.
   * `onUploadProgress(0..1)` reports upload progress via XHR so the UI can
   * show a real progress bar (fetch has no upload progress events).
   */
  processVideo(videoId, file, { onUploadProgress, signal } = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${BASE_URL}${VIDEOS_PREFIX}/${videoId}/process-video`)
      xhr.withCredentials = true

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onUploadProgress) onUploadProgress(e.loaded / e.total)
      }
      xhr.onload = () => {
        let data = null
        try {
          data = JSON.parse(xhr.responseText)
        } catch {
          data = null
        }
        if (xhr.status >= 200 && xhr.status < 300 && data?.success !== false) resolve(data)
        else reject(new ApiError(data?.message || `Upload failed (${xhr.status})`, xhr.status))
      }
      xhr.onerror = () => reject(new ApiError("Upload failed — network error.", 0))
      xhr.onabort = () => reject(new ApiError("Upload cancelled.", 0))
      if (signal) signal.addEventListener("abort", () => xhr.abort())

      const form = new FormData()
      form.append("uploaded_file", file)
      xhr.send(form)
    })
  },
}

/* ------------------------------------------------------------------ */
/*  Chat — /api/v1/chats                                               */
/* ------------------------------------------------------------------ */
export const chatApi = {
  initializeChat(videoId) {
    return request(`${CHATS_PREFIX}/${videoId}/intialize-chat`, { method: "POST" })
  },
  getChatHistory() {
    return request(`${CHATS_PREFIX}/get-chat-history`)
  },
  viewChat(boxId) {
    return request(`${CHATS_PREFIX}/${boxId}/view-chat`)
  },

  /**
   * Streams the AI response for a message.
   * Calls `onToken(chunk)` for each streamed chunk of text.
   * Returns the full concatenated response text.
   */
  async streamResponse(chatId, message, { onToken, signal } = {}) {
    const res = await fetch(`${BASE_URL}${CHATS_PREFIX}/${chatId}/get-response-message`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ message }),
    })

    if (!res.ok || !res.body) {
      throw new ApiError(`Failed to get response (${res.status})`, res.status)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let full = ""
    let buffer = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Handle SSE frames separated by double newlines.
      const frames = buffer.split("\n\n")
      buffer = frames.pop() || ""

      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          const trimmed = line.trimStart()
          if (!trimmed.startsWith("data:")) continue
          const payload = trimmed.slice(5).trimStart()
          if (payload === "[DONE]") continue

          let token = null
          try {
            const parsed = JSON.parse(payload)
            if (typeof parsed?.type === "string") {
              if (parsed.type === "text-delta") {
                token = parsed.delta ?? ""
              }
              // other types (start, text-start, text-end, finish-step, finish, etc.) are ignored
            } else {
              token = parsed.token ?? parsed.content ?? parsed.delta ?? null
            }
          } catch {
            token = payload
          }

          if (token) {
            full += token
            onToken?.(token)
          }
        }
      }
    }

    // Flush any trailing plain-text buffer that wasn't SSE-framed.
    if (buffer.trim() && !buffer.includes("data:")) {
      full += buffer
      onToken?.(buffer)
    }
    return full
  },
}
