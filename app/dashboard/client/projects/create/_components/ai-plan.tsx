"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateProjectPlan } from "../_actions";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Code2, 
  ArrowRight, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Target,
  Cpu,
  Workflow
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AiModelId } from "@/lib/ai/models";

interface AiPlanProps {
  idea: string;
  answers: any;
  mode: string;
  modelId: AiModelId;
  onNext: (plan: any) => void;
}

export function AiPlan({ idea, answers, mode, modelId, onNext }: AiPlanProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      const p = await generateProjectPlan({ idea, answers, mode, modelId });
      setPlan(p);
      setLoading(false);
    }
    fetchPlan();
  }, [idea, answers, mode, modelId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Sparkles className="h-12 w-12 text-zinc-200 animate-pulse" />
          <Loader2 className="h-12 w-12 text-zinc-900 animate-spin absolute inset-0 dark:text-zinc-50" />
        </div>
        <p className="text-zinc-500 font-medium text-center">AI is crafting your custom project plan,<br/>milestones, and technical architecture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Your AI-Powered Roadmap</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Review the comprehensive strategic plan generated for your idea.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Summary & Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="h-2 bg-zinc-900 dark:bg-zinc-100" />
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {plan.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <CheckCircle2 className="h-4 w-4" /> Core Deliverables
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {plan.deliverables.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
                        <div className="h-5 w-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center">
                          <span className="text-[10px]">{i + 1}</span>
                        </div>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <Workflow className="h-4 w-4" /> Strategic Milestones
                  </div>
                  <div className="space-y-4">
                    {plan.milestones.map((m: any, i: number) => (
                      <div key={i} className="relative pl-6 border-l-2 border-zinc-100 dark:border-zinc-800 pb-4 last:pb-0">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-zinc-900 dark:bg-zinc-900 dark:border-zinc-50" />
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-sm">{m.title}</h5>
                          <Badge variant="secondary" className="text-[10px]">{m.duration}</Badge>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{m.description}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-between h-12"
                onClick={() => setShowTech(!showTech)}
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="font-bold uppercase tracking-wider text-xs">AI Technical Mode</span>
                </div>
                {showTech ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {showTech && (
                <div className="p-6 rounded-2xl bg-zinc-950 text-zinc-50 space-y-6 animate-in fade-in slide-in-from-top-2 border shadow-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400 font-mono italic">// System Architecture Specs</p>
                    <Code2 className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {plan.technicalSpecs.map((spec: any, i: number) => (
                      <div key={i} className="space-y-1 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{spec.category}</p>
                        <p className="text-sm font-bold text-zinc-200">{spec.tech}</p>
                        <p className="text-[10px] text-zinc-400 leading-tight">{spec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Right Column: Risks & Success */}
        <div className="space-y-6">
          <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <AlertTriangle className="h-4 w-4" /> Risk Assessment
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.risks.map((r: any, i: number) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-bold">{r.risk}</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Mitigation: {r.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Target className="h-4 w-4" /> Success Metrics
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.successMetrics.map((m: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    <span className="text-zinc-900 dark:text-white mt-1">•</span>
                    {m}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="h-20 w-20" />
            </div>
            <CardContent className="p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Total Estimated Timeline</p>
              <p className="text-3xl font-bold">{plan.timeline}</p>
              <p className="text-[10px] opacity-60 italic pt-2">Based on current AI analysis of scope complexity.</p>
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full rounded-full h-14 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            onClick={() => onNext(plan)}
          >
            Confirm Plan & Set Budget
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}