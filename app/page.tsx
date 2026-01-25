import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Heptadev</span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">How it Works</Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            {session ? (
              <Button asChild variant="default" size="sm" className="rounded-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Login</Link>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
              Turn Ideas Into <span className="text-zinc-500 dark:text-zinc-400">Reality</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
              Heptadev is an AI-powered project marketplace that connects idea owners with top-tier talent. Guaranteed delivery, escrow payments, and AI-assisted planning.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {session ? (
                <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
                  <Link href="/dashboard">
                    Return to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
                    <Link href="/register">
                      Post your Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-base">
                    <Link href="/register">Find Work</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-50 px-4 py-24 dark:bg-zinc-900/50 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-800">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Planning</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Our AI helps you draft clear requirements and milestones, removing communication barriers between clients and talents.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-800">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Escrow Protection</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Payments are held in escrow and released only when milestones are approved, ensuring fairness for both parties.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-800">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Verified Talent</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Connect with skilled individuals and companies vetted for quality and professional standards.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-12 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Heptadev. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
