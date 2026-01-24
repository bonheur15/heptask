import { getApplicantDetails } from "./_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  DollarSign, 
  Calendar, 
  Star, 
  MessageSquare,
  XCircle,
  ThumbsUp,
  Link as LinkIcon,
  Clock,
  User as UserIcon,
  ShieldCheck,
  UserCheck,
  Ban
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptApplicant } from "../../_actions";
import { redirect } from "next/navigation";
import { AiMatchAnalysis } from "./_components/ai-match-analysis";

export default async function ApplicantReviewPage({ 
  params 
}: { 
  params: Promise<{ id: string; applicantId: string }> 
}) {
  const { id, applicantId } = await params;
  const applicantData = await getApplicantDetails(id, applicantId);
  
  const milestones = JSON.parse(applicantData.proposedMilestones || "[]");
  const persistedAiAnalysis = applicantData.aiAnalysis ? JSON.parse(applicantData.aiAnalysis) : null;

  async function handleAccept() {
    "use server";
    await acceptApplicant(id, applicantId, applicantData.userId);
    redirect(`/dashboard/client/projects/${id}`);
  }

  const isPending = applicantData.status === "pending";
  const isAccepted = applicantData.status === "accepted";
  const isRejected = applicantData.status === "rejected";

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-zinc-500">
          <Link href={`/dashboard/client/projects/${id}`}>
            <ChevronLeft className="h-4 w-4" /> Back to Project
          </Link>
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl dark:border-zinc-800">
              <AvatarImage src={applicantData.user.image || ""} />
              <AvatarFallback className="text-2xl">{applicantData.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isAccepted && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-white dark:border-zinc-950 shadow-lg">
                <UserCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{applicantData.user.name}</h1>
              <Badge variant={isAccepted ? "default" : isRejected ? "destructive" : "secondary"} className="uppercase tracking-widest text-[10px]">
                {applicantData.status}
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">{applicantData.user.location || "Location not set"}</p>
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
          {isPending ? (
            <>
              <form action={handleAccept}>
                <Button type="submit" size="lg" className="rounded-full h-12 px-8 shadow-lg gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95">
                  <ThumbsUp className="h-4 w-4" /> Accept & Hire
                </Button>
              </form>
              <Button variant="outline" size="lg" className="rounded-full h-12 px-8 gap-2 text-zinc-500 border-zinc-200">
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
              <Button variant="ghost" size="lg" className="rounded-full h-12 px-6 text-zinc-400 hover:text-red-500">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </>
          ) : isAccepted ? (
            <div className="flex items-center gap-3">
               <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-full flex gap-2 items-center">
                  <UserCheck className="h-4 w-4" /> HIRED ON THIS PROJECT
               </Badge>
               <Button variant="outline" size="lg" className="rounded-full h-12 px-8 gap-2">
                  <MessageSquare className="h-4 w-4" /> Open Workspace
               </Button>
            </div>
          ) : (
            <Badge variant="destructive" className="px-4 py-2 rounded-full flex gap-2 items-center">
              <Ban className="h-4 w-4" /> PROPOSAL REJECTED
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Proposal & Milestones */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* AI Match Score Component (Interactive Trigger) */}
          <AiMatchAnalysis 
            projectId={id} 
            applicantId={applicantId} 
            initialAnalysis={persistedAiAnalysis} 
          />

          {/* Proposal Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Proposal Pitch</h2>
            </div>
            <Card className="border-none shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg italic whitespace-pre-wrap">
                  "{applicantData.proposal}"
                </p>
                {applicantData.relevantLinks && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {applicantData.relevantLinks.split(",").map((link: string, i: number) => {
                      const url = link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`;
                      let hostname = "Link";
                      try { hostname = new URL(url).hostname; } catch(e) {}
                      return (
                        <Button key={i} variant="outline" size="sm" className="rounded-full gap-2 text-xs bg-white dark:bg-zinc-950" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-3 w-3" /> {hostname}
                          </a>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Proposed Roadmap */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-5 w-5" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Proposed Milestone Breakdown</h2>
            </div>
            <div className="space-y-3">
              {milestones.length > 0 ? milestones.map((m: any, i: number) => (
                <Card key={i} className="group hover:border-emerald-200 transition-colors border-zinc-100 dark:border-zinc-800">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm">{m.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">${m.amount}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Payment 0{i+1}</p>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <Clock className="h-8 w-8 text-zinc-200" />
                  <p className="text-sm text-zinc-500 font-medium">No detailed milestones were proposed for this bid.</p>
                </div>
              )}
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
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">About {applicantData.user.name.split(" ")[0]}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {applicantData.user.bio || "This user hasn't added a bio yet."}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Expertise & Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {applicantData.user.skills?.split(",").map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px] rounded-md px-2 py-0.5">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Joined</span>
                  <span className="font-bold">{new Date(applicantData.user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Role</span>
                  <span className="font-bold capitalize">{applicantData.user.role}</span>
                </div>
                {applicantData.user.website && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Website</span>
                    <a href={applicantData.user.website.startsWith("http") ? applicantData.user.website : `https://${applicantData.user.website}`} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline flex items-center gap-1">
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Secure Hire
              </h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-500 leading-relaxed">
                When you hire this talent, the funds will be transferred to our secure escrow system and released based on the proposed milestones.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}