"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateProjectPlan } from "../_actions";
import { Sparkles, CheckCircle2, Clock, Code2, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AiPlanProps {
  idea: string;
  answers: any;
  mode: string;
  onNext: (plan: any) => void;
}

export function AiPlan({ idea, answers, mode, onNext }: AiPlanProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      const p = await generateProjectPlan({ idea, answers, mode });
      setPlan(p);
      setLoading(false);
    }
    fetchPlan();
  }, [idea, answers, mode]);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Your AI-Powered Plan</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Review the deliverables and timeline the AI has proposed.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Deliverables
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.deliverables.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Estimated Timeline</p>
                  <p className="font-bold">{plan.timeline}</p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full">AI Estimated</Badge>
            </div>

            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between"
                onClick={() => setShowTech(!showTech)}
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="font-bold uppercase tracking-wider text-xs">Technical Mode</span>
                </div>
                {showTech ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {showTech && (
                <div className="p-4 rounded-xl bg-zinc-900 text-zinc-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-zinc-400 font-mono italic">// AI Proposed Tech Stack</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {plan.technicalSpecs.map((spec: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="text-zinc-600">{i + 1}.</span>
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="rounded-full px-8 gap-2 group" 
            onClick={() => onNext(plan)}
          >
            Approve & Set Budget
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
