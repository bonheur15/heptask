import Link from "next/link";
import { db } from "@/db";
import { project } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { isCompanyExclusiveProject } from "@/lib/projects/visibility";

type SearchParams = {
  q?: string;
  category?: string;
  budget?: string;
  duration?: string;
};

const categoryRules = [
  { label: "Product", match: ["product", "roadmap", "platform"] },
  { label: "Web", match: ["web", "website", "landing", "marketing"] },
  { label: "Mobile", match: ["mobile", "ios", "android", "app"] },
  { label: "Design", match: ["design", "brand", "ux", "ui"] },
  { label: "AI/ML", match: ["ai", "ml", "machine learning", "model"] },
];

const getCategory = (text: string) => {
  const lower = text.toLowerCase();
  const matched = categoryRules.find((rule) => rule.match.some((item) => lower.includes(item)));
  return matched?.label ?? "General";
};

const getDurationBucket = (createdAt: Date, deadline: Date | null) => {
  if (!deadline) return "open";
  const diffMs = deadline.getTime() - createdAt.getTime();
  const days = Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 0);
  if (days <= 30) return "short";
  if (days <= 90) return "medium";
  return "long";
};

const formatDuration = (createdAt: Date, deadline: Date | null) => {
  if (!deadline) return "Open timeline";
  const diffMs = deadline.getTime() - createdAt.getTime();
  const days = Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 0);
  return `${days} days`;
};

const matchesBudget = (budgetValue: number, filter?: string) => {
  if (!filter) return true;
  if (filter === "0-2000") return budgetValue <= 2000;
  if (filter === "2000-8000") return budgetValue > 2000 && budgetValue <= 8000;
  if (filter === "8000-20000") return budgetValue > 8000 && budgetValue <= 20000;
  if (filter === "20000+") return budgetValue > 20000;
  return true;
};

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const categoryFilter = searchParams.category ?? "";
  const budgetFilter = searchParams.budget ?? "";
  const durationFilter = searchParams.duration ?? "";

  const projects = await db.query.project.findMany({
    where: eq(project.status, "active"),
    orderBy: desc(project.createdAt),
  });

  const filtered = projects.filter((item) => {
    if (isCompanyExclusiveProject(item.companyExclusiveUntil)) {
      return false;
    }
    const combined = `${item.title} ${item.description}`;
    const category = getCategory(combined);
    const budgetValue = Number.parseFloat(item.budget ?? "0") || 0;
    const duration = getDurationBucket(item.createdAt, item.deadline);

    const matchesQuery = !query || combined.toLowerCase().includes(query);
    const matchesCategory = !categoryFilter || categoryFilter === category;
    const matchesBudgetRange = matchesBudget(budgetValue, budgetFilter);
    const matchesDuration = !durationFilter || durationFilter === duration;

    return matchesQuery && matchesCategory && matchesBudgetRange && matchesDuration;
  });

  return (
    <MarketingShell>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Public Projects</p>
          <h1 className="mt-4 text-4xl font-[var(--font-display)]">Explore projects looking for verified talent.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
            Public listings show the summary, budget, and timeline. Full requirements unlock after NDA approval.
          </p>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-6">
          <form className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]" method="get">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
              <Input name="q" defaultValue={query} placeholder="Search by title or focus area" className="pl-9" />
            </div>
            <select
              name="category"
              defaultValue={categoryFilter}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All categories</option>
              {categoryRules.map((rule) => (
                <option key={rule.label} value={rule.label}>
                  {rule.label}
                </option>
              ))}
              <option value="General">General</option>
            </select>
            <select
              name="budget"
              defaultValue={budgetFilter}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Any budget</option>
              <option value="0-2000">Up to $2K</option>
              <option value="2000-8000">$2K - $8K</option>
              <option value="8000-20000">$8K - $20K</option>
              <option value="20000+">$20K+</option>
            </select>
            <select
              name="duration"
              defaultValue={durationFilter}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Any duration</option>
              <option value="short">Under 30 days</option>
              <option value="medium">30-90 days</option>
              <option value="long">90+ days</option>
              <option value="open">Open timeline</option>
            </select>
            <Button type="submit" size="sm">Apply</Button>
          </form>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const budgetValue = Number.parseFloat(item.budget ?? "0") || 0;
              const category = getCategory(`${item.title} ${item.description}`);
              const durationLabel = formatDuration(item.createdAt, item.deadline);
              const isPriority = budgetValue >= 15000 || item.description.toLowerCase().includes("enterprise");

              return (
                <div key={item.id} className="rounded-3xl border border-black/10 bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{category}</Badge>
                    {isPriority ? (
                      <Badge className="bg-black text-white">Priority</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-xl font-[var(--font-display)]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)] line-clamp-3">
                    {item.description}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    <div className="flex items-center justify-between">
                      <span>Budget</span>
                      <span className="font-semibold text-[var(--ink)]">${budgetValue.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-semibold text-[var(--ink)]">{durationLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                    {item.ndaRequired ? (
                      <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> NDA required</span>
                    ) : (
                      <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Public brief</span>
                    )}
                    <Link href="/register" className="text-[var(--edge)]">Request access</Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 p-10 text-center text-sm text-[var(--muted)]">
              No projects match those filters. Try adjusting your search.
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
