"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createFinalProject } from "../_actions";
import { CheckCircle2, FileText, Send, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FinalizeProps {
  data: {
    idea: string;
    mode: string;
    answers: any;
    plan: any;
    budget: string;
    deadline: Date | undefined;
  };
  onBack: () => void;
}

export function Finalize({ data, onBack }: FinalizeProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePublish(status: "active" | "draft") {
    setLoading(true);
    try {
      const result = await createFinalProject({
        title: data.idea.split(" ").slice(0, 5).join(" ") + "...",
        description: data.idea,
        budget: data.budget,
        deadline: data.deadline?.toISOString() || "",
        plan: data.plan,
        status,
      });
      toast.success(status === "active" ? "Project published successfully!" : "Project saved as draft.");
      router.push("/dashboard/client");
    } catch (error) {
      toast.error("Failed to save project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ready to launch?</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Review your final project details one last time.</p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-800"></div>
        <CardHeader>
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">
            <FileText className="h-4 w-4" /> Final Project Summary
          </div>
          <CardTitle className="text-2xl">{data.idea.split(" ").slice(0, 10).join(" ")}...</CardTitle>
          <CardDescription>Created with AI {data.mode === "fast" ? "Fast Mode" : "Advanced Mode"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <p className="text-xs text-zinc-500 uppercase font-bold">Budget</p>
              <p className="text-lg font-bold text-emerald-600">${data.budget}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <p className="text-xs text-zinc-500 uppercase font-bold">Timeline</p>
              <p className="text-lg font-bold text-blue-600">{data.plan.timeline}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase font-bold">Core Deliverables</p>
            <div className="space-y-2">
              {data.plan.deliverables.slice(0, 3).map((d: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{d}</span>
                </div>
              ))}
              <p className="text-xs text-zinc-400 pl-6">and {data.plan.deliverables.length - 3} more...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Button variant="ghost" onClick={onBack} disabled={loading} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Edit
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="gap-2 rounded-full px-8" 
            onClick={() => handlePublish("draft")}
            disabled={loading}
          >
            <Save className="h-4 w-4" /> Save as Draft
          </Button>
          <Button 
            className="gap-2 rounded-full px-12 shadow-lg" 
            onClick={() => handlePublish("active")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" /> Publish Project
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
