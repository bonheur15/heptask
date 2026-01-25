import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Globe2, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { db } from "@/db";
import { escrowTransaction, project } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";

export default async function Home() {
  const projects = await db.query.project.findMany({
    columns: {
      id: true,
      title: true,
      status: true,
      budget: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: desc(project.createdAt),
  });

  const deposits = await db.query.escrowTransaction.findMany({
    columns: {
      amount: true,
      type: true,
    },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter((item) => item.status === "active").length;
  const completedProjects = projects.filter((item) => item.status === "completed");
  const totalEscrow = deposits
    .filter((item) => item.type === "deposit")
    .reduce((sum, item) => sum + Number.parseFloat(item.amount ?? "0"), 0);
  const stories = completedProjects.slice(0, 3);

  return (
    <MarketingShell>
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--accent)]/30 blur-[120px]" />
          <div className="absolute right-20 top-32 h-48 w-48 rounded-full bg-[var(--accent-2)]/30 blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(17,17,17,0.06),_transparent_60%)]" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Launch. Align. Deliver.</p>
            <h1 className="text-5xl font-[var(--font-display)] tracking-tight sm:text-6xl">
              Turn Ideas Into Reality with a team that ships on time.
            </h1>
            <p className="text-lg text-[var(--muted)]">
              Heptadev blends AI planning, escrow protection, and vetted talent to keep projects moving from kickoff to final release.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[var(--edge)] px-6 py-3 text-sm font-semibold text-white">
                Post a Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Find Work
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Join as Company
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.4)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Live Activity</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Active Projects</p>
                    <p className="text-xs text-[var(--muted)]">Currently in execution</p>
                  </div>
                  <p className="text-2xl font-[var(--font-display)]">{activeProjects}</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Escrow Protected</p>
                    <p className="text-xs text-[var(--muted)]">Deposits in the platform</p>
                  </div>
                  <p className="text-2xl font-[var(--font-display)]">${totalEscrow.toFixed(0)}</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Total Projects</p>
                    <p className="text-xs text-[var(--muted)]">Matched across the network</p>
                  </div>
                  <p className="text-2xl font-[var(--font-display)]">{totalProjects}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-[var(--edge)]/95 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Workspace Highlights</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Milestone approvals</span>
                  <span className="font-semibold">{completedProjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Talent pipeline</span>
                  <span className="font-semibold">Verified teams</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">AI-assisted planning</span>
                  <span className="font-semibold">Always on</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Brief in minutes", icon: Sparkles, text: "Use the AI project builder to convert ideas into structured scope, milestones, and budgets." },
              { title: "Match & align", icon: Users, text: "Invite vetted talent, compare proposals, and align on milestones before work begins." },
              { title: "Deliver & release", icon: Wallet, text: "Track progress, approve milestones, and release escrow payments with audit trails." },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-6">
                <item.icon className="h-6 w-6 text-[var(--edge)]" />
                <h3 className="mt-4 text-xl font-[var(--font-display)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">For Clients</p>
            <h2 className="mt-4 text-3xl font-[var(--font-display)]">Keep delivery visible, protected, and fast.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />Escrow holds funds until each milestone is approved.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />AI planning clarifies scope and reduces revision cycles.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-2)]" />Workspace updates keep stakeholders aligned with delivery health.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">For Talent</p>
            <h2 className="mt-4 text-3xl font-[var(--font-display)]">Work with clarity, get paid with confidence.</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Proposals map directly to milestone payouts.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Workspaces bundle chat, files, and approvals in one place.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />Dispute resolution backed by AI analysis and human review.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <ShieldCheck className="h-6 w-6 text-[var(--edge)]" />
            <h3 className="mt-4 text-xl font-[var(--font-display)]">Safety & Escrow</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Funds stay protected until milestones are approved, with audit trails for every release.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <Bot className="h-6 w-6 text-[var(--edge)]" />
            <h3 className="mt-4 text-xl font-[var(--font-display)]">AI Project Planning</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Convert loose ideas into milestone plans, timelines, and deliverable checklists.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8">
            <Globe2 className="h-6 w-6 text-[var(--edge)]" />
            <h3 className="mt-4 text-xl font-[var(--font-display)]">Global Talent, Local Control</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Browse verified talent or let Heptadev match teams based on scope and urgency.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Testimonials</p>
              <h2 className="mt-3 text-3xl font-[var(--font-display)]">Recent completions that showcase real outcomes.</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Based on the latest closed projects on Heptadev.</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--edge)]">
              Explore live projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div key={story.id} className="rounded-2xl border border-black/5 p-4">
                  <p className="text-sm font-semibold">{story.title}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Completed {formatDistanceToNow(story.updatedAt, { addSuffix: true })}
                  </p>
                  <p className="mt-3 text-sm font-[var(--font-display)]">
                    Budget ${Number.parseFloat(story.budget ?? "0").toFixed(0)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-black/10 p-8 text-sm text-[var(--muted)]">
                New projects are coming in daily. Check back soon.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl rounded-[36px] border border-black/10 bg-[var(--edge)] p-10 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Ready to launch your next build?</h2>
              <p className="mt-3 text-sm text-white/70">
                Post a project, explore work, or join as an enterprise team. Choose your path and let Heptadev handle the rest.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--edge)]">
                Post a Project
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                Find Work
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white">
                Join as Company
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
