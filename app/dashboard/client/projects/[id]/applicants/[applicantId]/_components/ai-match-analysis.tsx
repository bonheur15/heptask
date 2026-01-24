"use client";

import { useState } from "react";
import { getAiMatchAnalysis } from "../_actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Cpu, 
  Settings2,
  Zap,
  ArrowRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AVAILABLE_MODELS, AiModelId } from "@/lib/ai/models";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AiMatchAnalysisProps {
  projectId: string;
  applicantId: string;
  initialAnalysis: any;
}

export function AiMatchAnalysis({ projectId, applicantId, initialAnalysis }: AiMatchAnalysisProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModelId>("gemini-2.5-flash-lite-preview-09-2025");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setIsDialogOpen(false);
    try {
      const result = await getAiMatchAnalysis(projectId, applicantId, selectedModel);
      setAnalysis(result);
      toast.success("AI Match Analysis generated!");
    } catch (error) {
      toast.error("Failed to generate AI analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 overflow-hidden relative min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">AI is analyzing applicant compatibility...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center">
            <Brain className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Generate AI Match Report</h3>
            <p className="text-sm text-zinc-500 max-w-sm">Get an instant strategic analysis of how well this talent matches your project requirements.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full px-8 gap-2 group">
                <Sparkles className="h-4 w-4" /> Start AI Analysis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure AI Analysis</DialogTitle>
                <DialogDescription>
                  Choose the AI model you want to use for this talent match analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">Select Engine</label>
                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as AiModelId)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="font-bold">{m.name} {m.recommended && "✨"}</span>
                            <span className="text-[10px] text-zinc-500">{m.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="rounded-full px-8" onClick={handleGenerate}>Run Analysis</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 overflow-hidden relative transition-all hover:shadow-emerald-500/10">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Brain className="h-32 w-32" />
      </div>
      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <Zap className="h-3 w-3" /> AI Strategic Match
            </div>
            <h3 className="text-2xl font-black italic">Strategic Analysis</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-5xl font-black text-emerald-400">{analysis.score}%</span>
            <span className="text-[10px] uppercase font-bold opacity-60">Match Score</span>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-tighter opacity-60 flex items-center gap-2 text-emerald-400">
              <Sparkles className="h-3 w-3" /> Core Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
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
              {analysis.risks.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed opacity-80 italic text-amber-200 dark:text-amber-700">
                  <span className="text-amber-400 mt-1">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10 dark:border-zinc-200">
          <p className="text-xs leading-relaxed italic opacity-80">
            <span className="font-bold uppercase not-italic mr-2">Verdict:</span>
            {analysis.verdict}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
