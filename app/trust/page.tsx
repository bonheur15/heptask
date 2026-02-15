import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, FileLock2, Gavel, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function TrustPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-8 top-6 h-44 w-44 rounded-full bg-[var(--accent-2)]/25 blur-3xl" />
          <div className="absolute right-8 top-6 h-44 w-44 rounded-full bg-[var(--accent)]/25 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Trust & Safety</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Confidence built into project execution.</h1>
          <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
            Heptadev protects every deal using escrow controls, NDA enforcement, and a structured resolution stack.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Escrow Protection", text: "Funds move only through approved release rules." },
            { icon: FileLock2, title: "NDA Enforcement", text: "Sensitive scope remains protected until agreement." },
            { icon: Bot, title: "AI Review", text: "Fast dispute triage with context-aware summaries." },
            { icon: Gavel, title: "Human Arbitration", text: "Escalation path for complex, high-risk disputes." },
            { icon: UserCheck, title: "Verification", text: "Risk-aware KYC and account screening controls." },
            { icon: BadgeCheck, title: "Fraud Monitoring", text: "Behavior-based checks for suspicious patterns." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-6">
              <item.icon className="h-6 w-6 text-[var(--edge)]" />
              <h3 className="mt-4 text-lg font-[var(--font-display)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Dispute Model</p>
              <h3 className="mt-3 text-2xl font-[var(--font-display)]">AI first, human final</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                AI organizes evidence and timeline context first. If unresolved, a human specialist adjudicates.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Payout Safety</p>
              <h3 className="mt-3 text-2xl font-[var(--font-display)]">Processing state fallback</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Failed payout attempts remain in processing for manual finance handling instead of disappearing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Need stronger governance controls?</h2>
              <p className="mt-2 text-sm text-white/70">
                Enterprise accounts include dedicated compliance workflows and accelerated support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/enterprise" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Explore Enterprise <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                See Workflow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
