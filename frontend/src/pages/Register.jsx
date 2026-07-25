import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { SocialButtons } from "@/components/auth/SocialButtons"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = "Choose a username."
    else if (form.username.trim().length < 3) e.username = "Username must be at least 3 characters."

    if (!form.email.trim()) e.email = "Enter your email."
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address."

    if (!form.password) e.password = "Create a password."
    else if (form.password.length < 10)
      e.password = "Password must be at least 10 characters."
    else if (form.password.length > 100)
      e.password = "Password must be 100 characters or fewer."

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      toast.success("Account created! Please log in.")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error(err.message || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start chatting with your videos in minutes.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username"
          placeholder="jane_doe"
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          error={errors.username}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 10 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="Use 10–100 characters."
        />
        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          Create account
        </Button>
      </form>

      <Divider />
      <SocialButtons />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
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
