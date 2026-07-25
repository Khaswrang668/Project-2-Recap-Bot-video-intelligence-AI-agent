import { Link } from "react-router-dom"
import { MessageSquareText, Sparkles, Search } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Left: brand / marketing panel (hidden on small screens) */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <Link to="/">
          <Logo />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-balance text-3xl font-bold leading-tight text-foreground">
            Turn any video into a conversation.
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Upload a video and Recap Bot transcribes it, understands it, and answers your
            questions with pinpoint accuracy.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            <Feature icon={MessageSquareText} title="Chat naturally">
              Ask follow-up questions like you would with a friend.
            </Feature>
            <Feature icon={Search} title="Semantic search">
              Answers grounded in the exact moments of your video.
            </Feature>
            <Feature icon={Sparkles} title="Instant recaps">
              Summaries and key takeaways in seconds.
            </Feature>
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Recap Bot. All rights reserved.
        </p>
      </aside>

      {/* Right: form */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between p-5 lg:justify-end">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Feature({ icon: Icon, title, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}
