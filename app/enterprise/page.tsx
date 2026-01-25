import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Clock4, ShieldCheck, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function EnterprisePage() {
  return (
    <MarketingShell>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Enterprise Priority</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Priority access for teams that cannot miss a deadline.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Enterprise customers receive reserved capacity, SLA-backed delivery, and a dedicated account manager across every project.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Tier 1 Priority</p>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Reserved talent pods for mission-critical work.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />Dedicated pod with guaranteed availability.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />24-hour intake and kickoff response window.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />Custom contracts and procurement support.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Tier 2 Priority</p>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Queue acceleration for growing teams.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Faster matching with vetted specialists.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Milestone audits and delivery health monitoring.</li>
              <li className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Priority dispute resolution flow.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Early Access", text: "Access priority projects before the public marketplace." },
            { icon: Clock4, title: "SLA Guarantees", text: "Service-level response times for reviews and approvals." },
            { icon: ShieldCheck, title: "Custom Contracts", text: "Legal and compliance support for every engagement." },
            { icon: Briefcase, title: "Account Manager", text: "Dedicated lead across scopes, risks, and staffing." },
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
              <h2 className="text-3xl font-[var(--font-display)]">Need enterprise-level delivery?</h2>
              <p className="mt-2 text-sm text-white/70">
                Join as a company and unlock tiered priority access today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Join as Company <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
