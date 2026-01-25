import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

const tiers = [
  {
    title: "Client Fees",
    price: "3%",
    description: "Platform fee applied to escrow releases.",
    highlights: [
      "Escrow protection and audit logs",
      "AI planning and milestone templates",
      "Dispute resolution coverage",
    ],
  },
  {
    title: "Talent Fees",
    price: "8%",
    description: "Service fee deducted from released milestones.",
    highlights: [
      "Guaranteed milestone payouts",
      "Priority support on disputes",
      "Portfolio-ready workspaces",
    ],
  },
  {
    title: "Escrow Fees",
    price: "1.5%",
    description: "Processing and payment handling.",
    highlights: [
      "Card + bank transfer support",
      "Multi-release milestone handling",
      "Refund safeguards",
    ],
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Pricing</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Transparent fees that scale with your projects.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Fees are aligned to the value we protect: escrow, delivery governance, and enterprise-grade support.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.title} className="rounded-3xl border border-black/10 bg-white p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{tier.title}</p>
              <p className="mt-4 text-4xl font-[var(--font-display)]">{tier.price}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{tier.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                {tier.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <Wrench className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.2em]">Maintenance</p>
            </div>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Maintenance subscriptions</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Add ongoing support plans after launch for critical systems, updates, and monitoring.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Monthly health reports and backlog planning.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Priority response for production incidents.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Budgeted enhancement hours.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.2em]">Enterprise Plans</p>
            </div>
            <h2 className="mt-4 text-2xl font-[var(--font-display)]">Custom enterprise pricing</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Dedicated account management, SLA guarantees, and procurement-ready contracts.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Reserved talent pods and early access queue.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Legal, compliance, and security reviews.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />SLA-backed delivery operations.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Ready to start?</h2>
              <p className="mt-2 text-sm text-white/70">
                Create a project or explore work to see pricing in action.
              </p>
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
