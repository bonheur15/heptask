import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Clock4, ShieldCheck, Users, Crown, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function EnterprisePage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-[var(--accent)]/25 blur-3xl" />
          <div className="absolute right-8 top-8 h-44 w-44 rounded-full bg-[var(--accent-2)]/25 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Enterprise Priority</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Priority delivery for teams with strict timelines.</h1>
          <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
            Enterprise plans provide reserved capacity, structured governance, and faster response cycles for critical programs.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Tier 1 Priority</p>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Reserved pods for mission-critical execution.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" /> Dedicated pod with guaranteed availability.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" /> Priority intake and kickoff response windows.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" /> Procurement-ready contracting support.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Tier 2 Priority</p>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Accelerated queue for growth-stage teams.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" /> Faster matching with vetted specialists.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" /> Milestone risk audits and reporting cadence.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" /> Priority dispute routing and support.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Early Access", text: "See priority-ready projects before general discovery opens." },
            { icon: Clock4, title: "SLA Timelines", text: "Service-level commitments for key workflow checkpoints." },
            { icon: ShieldCheck, title: "Compliance", text: "Security and legal support for regulated workflows." },
            { icon: Briefcase, title: "Account Lead", text: "Dedicated coordination across staffing and delivery risks." },
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Visibility</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Priority Window</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Company accounts access newly published projects before public rollout.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Governance</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Team Controls</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Centralized assignment, role management, and reporting.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Support</p>
              <p className="mt-2 text-xl font-[var(--font-display)]">Escalation Paths</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Faster resolution channels for critical blockers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Enterprise-ready team operations</h2>
              <p className="mt-2 text-sm text-white/70">Upgrade your account and activate company-level workflows.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/billing" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                <Crown className="h-4 w-4" /> Upgrade to Enterprise
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                Join as Company <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
