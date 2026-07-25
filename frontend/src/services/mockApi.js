/**
 * In-memory mock backend used when VITE_DEMO_MODE !== "false".
 *
 * It mirrors the real API surface (same method names, same response shapes)
 * so the UI code is identical in demo and production. State is persisted to
 * localStorage purely so a page refresh keeps the demo session — this is a
 * demo-only convenience and is NOT how the production build stores data.
 */

const LS_KEY = "recapbot_demo_state"
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const uid = () => Math.random().toString(36).slice(2, 10)

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null
  } catch {
    return null
  }
}
function save(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

let state = load() || {
  user: null, // { username, email }
  loggedIn: false,
  boxes: [], // { boxId, videoId, title, created_at }
  messages: {}, // boxId -> [{ user_query, response, created_at }]
}
const persist = () => save(state)

/* Canned AI answers for a believable streaming demo. */
const CANNED = [
  "Based on the transcript, here are the **key points** from the video:\n\n1. The speaker opens by framing the core problem and why it matters.\n2. They walk through a concrete example to make the idea tangible.\n3. The segment closes with actionable takeaways you can apply right away.\n\nWant me to expand on any of these sections?",
  "Great question. In the video, this is covered around the middle section. The main argument is that **consistency beats intensity** — small repeated actions compound over time.\n\n> \"It's not what you do once, it's what you do repeatedly that shapes the outcome.\"\n\nLet me know if you'd like the surrounding context.",
  "Here's a quick summary of that part:\n\n- **Setup:** the presenter introduces the scenario.\n- **Insight:** the surprising finding that reframes the topic.\n- **Application:** how to use it in practice.\n\nIs there a specific moment you want me to dig into?",
  "From the transcript, the speaker mentions three tools:\n\n| Tool | Purpose |\n| --- | --- |\n| Approach A | Fast prototyping |\n| Approach B | Reliable scaling |\n| Approach C | Long-term maintenance |\n\nThey recommend starting with Approach A and migrating later.",
]
let cannedIndex = 0

export const authApi = {
  async register({ username, email, password }) {
    await delay(700)
    if (!username || !email || !password) {
      throw makeError("All fields are required.")
    }
    return { success: true, message: "Account created. You can now log in.", body: { username, email } }
  },
  async login({ identifier, password }) {
    await delay(700)
    if (!identifier || !password) throw makeError("Please enter your credentials.")
    const username = identifier.includes("@") ? identifier.split("@")[0] : identifier
    const email = identifier.includes("@") ? identifier : `${identifier}@example.com`
    state.user = { username, email }
    state.loggedIn = true
    persist()
    return { success: true, accessToken: "demo-token", message: "Logged in." }
  },
  async logout() {
    await delay(300)
    state.loggedIn = false
    state.user = null
    persist()
    return { success: true, message: "Logged out." }
  },
  async refresh() {
    await delay(400)
    if (!state.loggedIn || !state.user) throw makeError("Session expired.", 401)
    return { success: true, message: "Session restored.", body: state.user }
  },
}

export const videoApi = {
  async getVideoId() {
    await delay(400)
    return { success: true, message: "Video id issued.", videoId: uid() }
  },
  async processVideo(videoId, file, { onUploadProgress, signal } = {}) {
    // Simulate upload progress.
    for (let p = 0; p <= 1; p += 0.08) {
      if (signal?.aborted) throw makeError("Upload cancelled.")
      onUploadProgress?.(Math.min(p, 1))
      await delay(120)
    }
    onUploadProgress?.(1)
    // Simulate server-side transcription + embedding.
    await delay(2600)
    if (signal?.aborted) throw makeError("Cancelled.")
    // Stash a friendly title derived from the file name.
    const title = file?.name ? file.name.replace(/\.[^.]+$/, "") : "Untitled video"
    state._pendingTitle = state._pendingTitle || {}
    state._pendingTitle[videoId] = title
    persist()
    return { success: true, message: "Video processed successfully." }
  },
}

export const chatApi = {
  async initializeChat(videoId) {
    await delay(500)
    const boxId = uid()
    const title = state._pendingTitle?.[videoId] || "New video chat"
    const box = { boxId, videoId, title, created_at: new Date().toISOString() }
    state.boxes.unshift(box)
    state.messages[boxId] = []
    if (state._pendingTitle) delete state._pendingTitle[videoId]
    persist()
    return { success: true, message: "Chat initialized.", body: boxId }
  },
  async getChatHistory() {
    await delay(400)
    return { success: true, chatHistory: state.boxes.slice(0, 10) }
  },
  async viewChat(boxId) {
    await delay(350)
    return { success: true, messages: state.messages[boxId] || [] }
  },
  async streamResponse(chatId, message, { onToken, signal } = {}) {
    await delay(500)
    const text = CANNED[cannedIndex % CANNED.length]
    cannedIndex++

    // Stream word-by-word to mimic token streaming.
    const tokens = text.match(/\S+\s*/g) || [text]
    let full = ""
    for (const t of tokens) {
      if (signal?.aborted) break
      full += t
      onToken?.(t)
      await delay(28)
    }

    // Persist the completed exchange.
    if (!state.messages[chatId]) state.messages[chatId] = []
    state.messages[chatId].push({
      user_query: message,
      response: full,
      created_at: new Date().toISOString(),
    })
    persist()
    return full
  },
}

function makeError(message, status = 400) {
  const e = new Error(message)
  e.name = "ApiError"
  e.status = status
  return e
}
