import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileLock2, Gavel, Layers, ShieldCheck, Wallet, TimerReset, Users2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

const sections = [
  {
    title: "For Clients",
    items: [
      "Convert rough ideas into full delivery plans with AI-guided interviews.",
      "Review plan quality, budget feasibility, and timeline confidence before publishing.",
      "Publish with paid verification, company-priority visibility, and protected escrow releases.",
    ],
  },
  {
    title: "For Talents & Companies",
    items: [
      "Discover priority-ready projects and apply with structured milestone proposals.",
      "Sign NDA before accessing sensitive scope, files, and implementation details.",
      "Work in a shared workspace where approvals, files, and payout actions stay traceable.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-10 top-8 h-44 w-44 rounded-full bg-[var(--accent)]/25 blur-3xl" />
          <div className="absolute right-10 top-10 h-44 w-44 rounded-full bg-[var(--accent-2)]/25 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Workflow Blueprint</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">How Heptadev moves from idea to paid delivery.</h1>
          <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
            The workflow is designed to reduce ambiguity, protect funds, and speed up matching between clients and execution teams.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-black/10 bg-white p-8">
              <h2 className="text-2xl font-[var(--font-display)]">{section.title}</h2>
              <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Phase 1</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Plan</p>
              <p className="mt-2 text-sm text-[var(--muted)]">AI-assisted project definition and feasibility checks.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Phase 2</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Match</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Company-priority access, then public visibility after 24 hours.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Phase 3</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Execute</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Milestone approvals, escrow releases, and payout tracking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Bot, title: "AI Builder", text: "Convert ideas into scope, milestones, and execution notes." },
            { icon: FileLock2, title: "NDA Gate", text: "Protect sensitive details before full project access." },
            { icon: Wallet, title: "Escrow", text: "Payment security with auditable releases and refund controls." },
            { icon: Layers, title: "Milestones", text: "Track work in measurable approval checkpoints." },
            { icon: Gavel, title: "Disputes", text: "AI + human review paths for high-stakes disagreements." },
            { icon: ShieldCheck, title: "Trust Rules", text: "KYC/fraud controls where risk level demands it." },
            { icon: TimerReset, title: "Priority Windows", text: "24-hour company-first visibility before public open." },
            { icon: Users2, title: "Collaboration", text: "Shared workspaces for client, talent, and company teams." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-6">
              <item.icon className="h-6 w-6 text-[var(--edge)]" />
              <h3 className="mt-4 text-lg font-[var(--font-display)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Ready to start the workflow?</h2>
              <p className="mt-2 text-sm text-white/70">Build your project brief or explore open opportunities.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Post a Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
