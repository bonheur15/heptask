"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Link as LinkIcon, 
  Info,
  Clock,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SubmittedProposal({ application }: { application: any }) {
  const milestones = JSON.parse(application.proposedMilestones || "[]");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Application Submitted</h2>
          <p className="text-sm text-zinc-500">Your proposal is now under review by the client.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="h-1.5 bg-emerald-500" />
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Your Official Proposal
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
              PENDING REVIEW
            </Badge>
          </div>
          <CardTitle className="text-2xl mt-4">Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pitch Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <Info className="h-3.5 w-3.5" /> Your Pitch
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-sm bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              {application.proposal}
            </p>
          </div>

          {/* Links Section */}
          {application.relevantLinks && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <LinkIcon className="h-3.5 w-3.5" /> Portfolio & Relevant Links
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 break-all underline underline-offset-4">
                {application.relevantLinks}
              </p>
            </div>
          )}

          {/* Financials & Timeline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Proposed Budget</p>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-xl font-bold">${application.budget}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Est. Completion</p>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-bold">{application.timeline}</span>
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <Clock className="h-3.5 w-3.5" /> Proposed Milestones
            </div>
            <div className="space-y-3">
              {milestones.map((m: any, index: number) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid gap-4 sm:grid-cols-2 items-center">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">{m.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">${m.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
