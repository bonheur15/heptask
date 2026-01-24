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
  FileText
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NdaGate } from "./_components/nda-gate";
import { ApplicationForm } from "./_components/application-form";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { job, ndaSigned, hasApplied } = await getJobDetails(id);

  if (hasApplied) {
    // Optionally redirect or show a "Already Applied" state
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href="/dashboard/talent/jobs">
            <ChevronLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </div>

      {/* Job Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
              Verified Project
            </Badge>
            {job.ndaRequired && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest flex gap-1 items-center">
                <ShieldCheck className="h-2.5 w-2.5" /> NDA Protected
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Budget: ${job.budget}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {ndaSigned && !hasApplied && (
            <Button size="lg" className="rounded-full shadow-lg gap-2" asChild>
              <a href="#apply">Apply for this Job <Sparkles className="h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>

      {!ndaSigned ? (
        <NdaGate projectId={id} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-400" />
                  Full Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
                
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-widest">AI Generated Roadmap</h4>
                  <div className="space-y-4">
                    {JSON.parse(job.plan || "{}").milestones?.map((m: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{m.title}</p>
                          <p className="text-xs text-zinc-500">{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasApplied ? (
              <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Application Submitted!</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-500 max-w-md">
                    The client has been notified. You'll receive a message if they're interested in your proposal.
                  </p>
                  <Button variant="outline" asChild className="mt-4 border-emerald-200 hover:bg-emerald-100 dark:border-emerald-900/50">
                    <Link href="/dashboard/talent">Return to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div id="apply">
                <ApplicationForm projectId={id} />
              </div>
            )}
          </div>

          {/* Client Sidebar Widget */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border flex items-center justify-center font-bold">
                    {job.client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{job.client.name}</p>
                    <p className="text-xs text-zinc-500">Member since 2024</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Projects Posted</span>
                    <span className="font-bold">14</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Hire Rate</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Total Spent</span>
                    <span className="font-bold">$12.4k</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Escrow
                </h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                  Your payments are guaranteed by our AI-monitored escrow system. Funds are released automatically as milestones are approved.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
