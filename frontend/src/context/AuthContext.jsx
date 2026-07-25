import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { authApi } from "@/services/api"

const AuthContext = createContext(null)

/**
 * Holds auth state (current user + logged-in flag).
 * On load it silently attempts a token refresh to restore the session.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Attempt to restore session on first mount.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await authApi.refresh()
        if (active && res?.success) {
          // Real backend refresh may not echo the user; keep a minimal record.
          setUser(res.body || { username: "You", email: "" })
        }
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setInitializing(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async ({ identifier, password }) => {
    const res = await authApi.login({ identifier, password })
    const username = identifier.includes("@") ? identifier.split("@")[0] : identifier
    const email = identifier.includes("@") ? identifier : ""
    setUser(res.body || { username, email })
    return res
  }, [])

  const register = useCallback(async ({ username, email, password }) => {
    return authApi.register({ username, email, password })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
