import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { SocialButtons } from "@/components/auth/SocialButtons"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || "/app"

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!identifier.trim()) e.identifier = "Enter your username or email."
    if (!password) e.password = "Enter your password."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login({ identifier: identifier.trim(), password })
      toast.success("Welcome back!")
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back — pick up where you left off.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username or email"
          placeholder="you@example.com"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          Log In
        </Button>
      </form>

      <Divider />
      <SocialButtons />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
