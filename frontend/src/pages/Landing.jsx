import { Link } from "react-router-dom"
import {
  Upload,
  MessagesSquare,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/Button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useAuth } from "@/context/AuthContext"

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const primaryCta = isAuthenticated ? "/app" : "/register"

  return (
    <div className="min-h-dvh bg-background">
      <Header isAuthenticated={isAuthenticated} />
      <Hero primaryCta={primaryCta} />
      <Steps />
      <Features />
      <FinalCta primaryCta={primaryCta} />
      <Footer />
    </div>
  )
}

function Header({ isAuthenticated }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Logo />
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button as={Link} to="/app" size="sm">
              Open app
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" size="sm">
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero({ primaryCta }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 text-center md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles size={14} className="text-primary" />
          AI-powered video understanding
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
          Chat with any video like it&apos;s a conversation
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Upload a video and Recap Bot transcribes it, understands it, and answers your questions
          instantly — grounded in the exact moments that matter.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button as={Link} to={primaryCta} size="lg" className="w-full sm:w-auto">
            Get started free
            <ArrowRight size={18} />
          </Button>
          <Button as={Link} to="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
            Log in
          </Button>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            <img
              src="/hero-app.png"
              alt="Recap Bot chat interface showing a conversation about an uploaded video"
              className="w-full"
              width={1600}
              height={1000}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const steps = [
    {
      icon: Upload,
      title: "Upload your video",
      body: "Drop in a lecture, meeting, podcast, or tutorial. We handle the rest.",
    },
    {
      icon: Zap,
      title: "We process it",
      body: "Recap Bot transcribes and embeds your video for semantic search.",
    },
    {
      icon: MessagesSquare,
      title: "Start chatting",
      body: "Ask anything and get grounded answers with the context you need.",
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon size={20} />
              </span>
              <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Search,
      title: "Semantic search",
      body: "Answers are grounded in the transcript using vector search — not guesses.",
    },
    {
      icon: MessagesSquare,
      title: "Natural conversations",
      body: "Ask follow-ups and dig deeper. Recap Bot keeps the thread of your chat.",
    },
    {
      icon: Sparkles,
      title: "Instant recaps",
      body: "Get summaries, key takeaways, and highlights in seconds.",
    },
    {
      icon: ShieldCheck,
      title: "Private by default",
      body: "Your uploads are tied to your account and secured behind authentication.",
    },
  ]
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Everything you need to understand your videos
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Recap Bot turns hours of footage into instant, searchable knowledge.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ primaryCta }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center md:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <h2 className="relative text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to talk to your videos?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Create a free account and start your first conversation in under a minute.
        </p>
        <Button as={Link} to={primaryCta} size="lg" className="relative mt-8">
          Get started free
          <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Recap Bot. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
