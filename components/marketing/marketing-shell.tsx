import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Space_Grotesk, Manrope } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/projects", label: "Explore Projects" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust & Safety" },
];

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[var(--paper)] font-[var(--font-body)] text-[var(--ink)] [--accent:#ffb347] [--accent-2:#5fbf9e] [--edge:#1f2933] [--ink:#111111] [--muted:#5b5b5b] [--paper:#fdfbf7] dark:[--edge:#dce6ef] dark:[--ink:#f4f7fb] dark:[--muted:#9aa7b5] dark:[--paper:#0b1016]`}
    >
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--paper)]/80 backdrop-blur dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
              <span className="font-[var(--font-display)] text-xs">HD</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Heptadev</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Work OS</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[var(--ink)]">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/billing">Billing & Plans</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
                  Login
                </Link>
                <Button asChild size="sm">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-[var(--muted)] md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-[var(--font-display)] text-base text-[var(--ink)]">Heptadev</p>
            <p>AI-first delivery platform for clients, talent, and enterprise teams.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Explore</p>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[var(--ink)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Get Started</p>
            <div className="flex flex-col gap-2">
              <Link href="/register" className="hover:text-[var(--ink)]">Post a Project</Link>
              <Link href="/register" className="hover:text-[var(--ink)]">Find Work</Link>
              <Link href="/register" className="hover:text-[var(--ink)]">Join as Company</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-black/5 py-4 text-center text-xs text-[var(--muted)] dark:border-white/10">
          © {new Date().getFullYear()} Heptadev. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
