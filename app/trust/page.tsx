import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, FileLock2, Gavel, ShieldCheck, UserCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function TrustPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Trust & Safety</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Confidence built into every milestone.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Heptadev protects both sides with escrow, NDA enforcement, and structured dispute workflows.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Escrow Protection", text: "Funds stay secure until milestones are approved." },
            { icon: FileLock2, title: "NDA Enforcement", text: "Confidential details are protected before sharing." },
            { icon: Bot, title: "AI Dispute Resolution", text: "AI-assisted summaries and risk analysis speed up resolution." },
            { icon: Gavel, title: "Human Arbitration", text: "Expert reviewers step in when disputes escalate." },
            { icon: UserCheck, title: "KYC & Verification", text: "Identity verification keeps the network trusted." },
            { icon: BadgeCheck, title: "Fraud Prevention", text: "Continuous monitoring flags suspicious activity." },
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
              <h2 className="text-3xl font-[var(--font-display)]">Want extra protection?</h2>
              <p className="mt-2 text-sm text-white/70">
                Enterprise customers get dedicated compliance support and SLA-backed escalation paths.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/enterprise" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Explore Enterprise <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
