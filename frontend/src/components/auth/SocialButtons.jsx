import { useToast } from "@/context/ToastContext"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.417 2.2-1.11 2.985-.836.94-2.2 1.66-3.34 1.57-.135-1.11.43-2.29 1.09-3.03.75-.85 2.08-1.49 3.16-1.525.02.01.02.01.2 0zM20.5 17.06c-.54 1.25-.8 1.81-1.5 2.92-.98 1.55-2.36 3.48-4.07 3.5-1.52.02-1.91-.99-3.97-.98-2.06.01-2.49 1-4.01.99-1.71-.02-3.02-1.76-4-3.31-2.74-4.34-3.03-9.43-1.34-12.14 1.2-1.92 3.1-3.05 4.88-3.05 1.82 0 2.96 1 4.47 1 1.46 0 2.35-1 4.46-1 1.59 0 3.28.87 4.48 2.37-3.94 2.16-3.3 7.8.07 9.69z" />
    </svg>
  )
}

export function SocialButtons() {
  const toast = useToast()
  const comingSoon = (provider) =>
    toast.info(`${provider} sign-in is coming soon.`)

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => comingSoon("Google")}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-sidebar-hover"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => comingSoon("Apple")}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-sidebar-hover"
      >
        <AppleIcon />
        Continue with Apple
      </button>
    </div>
  )
}
