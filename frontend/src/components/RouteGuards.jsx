import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Logo } from "./ui/Logo"

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-10 w-10 animate-pulse" />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[loader_1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, initializing } = useAuth()

  if (initializing) return <FullScreenLoader />
  if (user) return <Navigate to="/app" replace />
  return children
}
