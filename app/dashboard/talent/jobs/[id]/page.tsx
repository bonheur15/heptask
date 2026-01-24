import { getJobDetails } from "./_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Lock,
  Sparkles,
  FileText,
  Cpu,
  AlertTriangle,
  Target,
  Workflow,
  Zap,
  Info
} from "lucide-react";
import Link from "next/link";
import { NdaGate } from "./_components/nda-gate";
import { ApplicationForm } from "./_components/application-form";
import { SubmittedProposal } from "./_components/submitted-proposal";
import { Separator } from "@/components/ui/separator";
import { Applicant, Project, ProjectPlan } from "@/lib/types";

type MilestoneItem = ProjectPlan["milestones"][number];
type TechnicalSpecItem = ProjectPlan["technicalSpecs"][number];
type RiskItem = ProjectPlan["risks"][number];

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { job, ndaSigned, hasApplied, application } = await getJobDetails(id);

  const plan: ProjectPlan = JSON.parse(job.plan || "{}");

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-zinc-500">
          <Link href="/dashboard/talent/jobs">
            <ChevronLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </div>

      {/* Job Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Zap className="h-3 w-3 mr-1 fill-emerald-500" /> Verified Project
            </Badge>
            {job.ndaRequired && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest flex gap-1 items-center bg-zinc-100 dark:bg-zinc-800">
                <ShieldCheck className="h-2.5 w-2.5" /> NDA Protected
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">
              {job.status}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{job.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
              <DollarSign className="h-4 w-4 text-emerald-600" /> 
              <span className="font-bold text-zinc-900 dark:text-zinc-100">${job.budget}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
              <Calendar className="h-4 w-4 text-blue-600" /> 
              <span className="font-medium">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> 
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {ndaSigned && !hasApplied && (
            <Button size="lg" className="rounded-full h-12 px-8 shadow-xl gap-2 font-bold transition-transform hover:scale-[1.02]" asChild>
              <a href="#apply">Apply Now <Sparkles className="h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>

      {!ndaSigned ? (
        <NdaGate projectId={id} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content (3 cols) */}
          <div className="lg:col-span-3 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Overview Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info className="h-5 w-5" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Project Overview</h2>
              </div>
              <Card className="border-none shadow-sm bg-zinc-50/30 dark:bg-zinc-900/20">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Client&apos;s Description</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg italic font-medium">
                      &quot;{job.description}&quot;
                    </p>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">AI Executive Summary</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {plan.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Strategic Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
               {/* Deliverables */}
               <Card className="border-zinc-100 dark:border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Core Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {plan.deliverables?.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                        <div className="h-5 w-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px]">{i + 1}</span>
                        </div>
                        <span className="text-sm font-medium">{d}</span>
                      </div>
                    ))}
                  </CardContent>
               </Card>

               {/* Tech Architecture */}
               <Card className="border-zinc-100 dark:border-zinc-800 bg-zinc-950 text-zinc-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                      <Cpu className="h-4 w-4" /> Technical Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.technicalSpecs?.map((spec: TechnicalSpecItem, i: number) => (
                      <div key={i} className="space-y-1 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{spec.category}</p>
                        <p className="text-sm font-bold text-zinc-200">{spec.tech}</p>
                        <p className="text-[10px] text-zinc-400 leading-tight italic">{spec.reason}</p>
                      </div>
                    ))}
                  </CardContent>
               </Card>
            </div>

            {/* Milestones Timeline */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Workflow className="h-5 w-5" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">AI Proposed Roadmap</h2>
              </div>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-100 before:to-transparent dark:before:via-zinc-800">
                {plan.milestones?.map((m: MilestoneItem, i: number) => (
                  <div key={i} className="relative flex items-start gap-6 pl-12 group">
                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-50 shadow-sm">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <Card className="flex-1 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors shadow-none">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">{m.title}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg">{m.description}</p>
                        </div>
                        <Badge variant="secondary" className="w-fit text-[10px] uppercase font-bold tracking-tighter shrink-0 h-6">
                          Est. {m.duration}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </section>

            {/* Risks & Success Section */}
            <div className="grid gap-6 md:grid-cols-2">
               <Card className="bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.risks?.map((r: RiskItem, i: number) => (
                      <div key={i} className="space-y-1 border-l-2 border-amber-200 pl-3">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{r.risk}</p>
                        <p className="text-[10px] text-zinc-500 leading-relaxed italic">Mitigation: {r.mitigation}</p>
                      </div>
                    ))}
                  </CardContent>
               </Card>

               <Card className="bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Success Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.successMetrics?.map((m: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                          <span className="text-blue-500 mt-1">•</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
               </Card>
            </div>

            {/* Application Section */}
            {hasApplied && application ? (
              <section className="pt-10 scroll-mt-20">
                <SubmittedProposal application={application} />
              </section>
            ) : (
              <section id="apply" className="pt-10 scroll-mt-20">
                <div className="flex items-center gap-2 text-zinc-400 mb-6">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Submit Your Proposal</h2>
                </div>
                <ApplicationForm projectId={id} initialBudget={job.budget || "0"} />
              </section>
            )}
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-zinc-100 dark:border-zinc-800 shadow-xl">
              <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                <CardTitle className="text-lg">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center text-xl font-black shadow-lg">
                    {job.client?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none">{job.client?.name || "Client"}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Verified Payment
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Platform Activity</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Senior Client</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Hire Rate</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Member since</span>
                    <span className="font-bold">Jan 2024</span>
                  </div>
                </div>
                <Separator />
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Payment Security
                  </h5>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500 leading-relaxed font-medium">
                    Funds for this project are ready to be deposited into escrow upon hiring.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-amber-400" /> Pro Tips
              </h4>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Clients on Heptadev prefer detailed milestones. Breaking your proposal into 4+ steps increases approval odds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
