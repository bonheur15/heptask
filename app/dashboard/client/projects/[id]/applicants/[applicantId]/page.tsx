import { getApplicantDetails, getAiMatchAnalysis } from "./_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronLeft,
  DollarSign,
  Calendar,
  Star,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  XCircle,
  ThumbsUp,
  AlertTriangle,
  Brain,
  Link as LinkIcon,
  Clock,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptApplicant } from "../../_actions";
import { redirect } from "next/navigation";

export default async function ApplicantReviewPage({
  params,
}: {
  params: Promise<{ id: string; applicantId: string }>;
}) {
  const { id, applicantId } = await params;
  const applicant = await getApplicantDetails(id, applicantId);

  // Fetch AI Match analysis
  let aiMatch;
  try {
    aiMatch = await getAiMatchAnalysis(id, applicantId);
  } catch (e) {
    console.log(e);
    aiMatch = null;
  }

  const milestones = JSON.parse(applicant.proposedMilestones || "[]");

  async function handleAccept() {
    "use server";
    await acceptApplicant(id, applicantId, applicant.userId);
    redirect(`/dashboard/client/projects/${id}`);
  }

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 -ml-2 text-zinc-500"
        >
          <Link href={`/dashboard/client/projects/${id}`}>
            <ChevronLeft className="h-4 w-4" /> Back to Project
          </Link>
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b pb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl dark:border-zinc-800">
            <AvatarImage src={applicant.user.image || ""} />
            <AvatarFallback className="text-2xl">
              {applicant.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {applicant.user.name}
              </h1>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
              >
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Talent
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              {applicant.user.location || "Location not set"}
            </p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" /> 4.9 (24 Reviews)
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-sm text-zinc-500">100% Job Success</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <form action={handleAccept}>
            <Button
              size="lg"
              className="rounded-full h-12 px-8 shadow-lg gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ThumbsUp className="h-4 w-4" /> Accept & Hire
            </Button>
          </form>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-12 px-8 gap-2 text-zinc-500 border-zinc-200"
          >
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full h-12 px-6 text-zinc-400 hover:text-red-500"
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Proposal & Milestones */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* AI Match Score Widget */}
          {aiMatch && (
            <Card className="border-none shadow-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="h-32 w-32" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                      AI Talent Matching
                    </p>
                    <h3 className="text-2xl font-black italic">
                      Strategic Analysis
                    </h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-5xl font-black text-emerald-400">
                      {aiMatch.score}%
                    </span>
                    <span className="text-[10px] uppercase font-bold opacity-60">
                      Match Score
                    </span>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-tighter opacity-60 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> Core Strengths
                    </h4>
                    <ul className="space-y-2">
                      {aiMatch.strengths.map((s: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs leading-relaxed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-tighter opacity-60 flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> Consideration Risks
                    </h4>
                    <ul className="space-y-2">
                      {aiMatch.risks.map((r: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs leading-relaxed opacity-80 italic"
                        >
                          <span className="text-amber-400 mt-1">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 dark:border-zinc-200">
                  <p className="text-xs leading-relaxed italic opacity-80">
                    <span className="font-bold uppercase not-italic mr-2">
                      Verdict:
                    </span>
                    {aiMatch.verdict}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposal Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Proposal Pitch
              </h2>
            </div>
            <Card>
              <CardContent className="p-8 space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg italic whitespace-pre-wrap">
                  "{applicant.proposal}"
                </p>
                {applicant.relevantLinks && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {applicant.relevantLinks
                      .split(",")
                      .map((link: string, i: number) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 text-xs"
                          asChild
                        >
                          <a
                            href={link.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LinkIcon className="h-3 w-3" />{" "}
                            {new URL(link.trim()).hostname}
                          </a>
                        </Button>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Proposed Roadmap */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-5 w-5" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Proposed Milestone Breakdown
              </h2>
            </div>
            <div className="space-y-3">
              {milestones.map((m: any, i: number) => (
                <Card
                  key={i}
                  className="group hover:border-emerald-200 transition-colors"
                >
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm">{m.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Due{" "}
                            {m.dueDate
                              ? new Date(m.dueDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        ${m.amount}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        Payment 0{i + 1}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: User Bio & Skills */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-zinc-100 dark:border-zinc-800 shadow-xl">
            <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-zinc-400" /> Full Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  About {applicant.user.name.split(" ")[0]}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {applicant.user.bio || "This user hasn't added a bio yet."}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Expertise & Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.user.skills
                    ?.split(",")
                    .map((skill: string, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[10px] rounded-md px-2 py-0.5"
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Joined</span>
                  <span className="font-bold">
                    {new Date(applicant.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Role</span>
                  <span className="font-bold capitalize">
                    {applicant.user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Website</span>
                  <Link
                    href={applicant.user.website || "#"}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Link <ExternalLinkIcon className="inline h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Secure Hire
              </h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-500 leading-relaxed">
                When you hire this talent, the funds will be transferred to our
                secure escrow system and released based on the proposed
                milestones.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
