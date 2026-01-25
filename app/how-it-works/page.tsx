import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileLock2, Gavel, Layers, ShieldCheck, Wallet } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

const sections = [
  {
    title: "For Clients",
    items: [
      "Define scope with AI-assisted interviews and milestone planning.",
      "Invite talent or receive curated matches from Heptadev.",
      "Fund escrow and approve milestones to release payments safely.",
    ],
  },
  {
    title: "For Talents",
    items: [
      "Browse live projects and see the short public brief.",
      "Submit proposals tied to milestone payouts and timelines.",
      "Deliver work through the workspace and request approvals.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Workflow</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">How Heptadev works from kickoff to close-out.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Every project moves through a structured workflow that keeps scope, payments, and delivery aligned.
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

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Bot, title: "AI Project Builder", text: "Convert ideas into structured scope, milestones, and budget guidance." },
            { icon: FileLock2, title: "NDA Protection", text: "Sensitive details unlock only after NDA execution." },
            { icon: Wallet, title: "Escrow Payments", text: "Funds are protected until each milestone is approved." },
            { icon: Layers, title: "Milestones", text: "Every stage has clear deliverables, due dates, and approvals." },
            { icon: Gavel, title: "Dispute Resolution", text: "AI analysis plus human arbitration when things get stuck." },
            { icon: ShieldCheck, title: "Maintenance Plans", text: "Optional post-launch support keeps products stable." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-6">
              <item.icon className="h-6 w-6 text-[var(--edge)]" />
              <h3 className="mt-4 text-xl font-[var(--font-display)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Ready to map your next project?</h2>
              <p className="mt-2 text-sm text-white/70">Start with the AI builder or explore open projects today.</p>
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
