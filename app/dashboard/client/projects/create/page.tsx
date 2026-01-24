"use client";

import { useState } from "react";
import { IdeaInput } from "./_components/idea-input";
import { ProcessMode } from "./_components/process-mode";
import { AiInterview } from "./_components/ai-interview";
import { AiPlan } from "./_components/ai-plan";
import { BudgetDeadline } from "./_components/budget-deadline";
import { Finalize } from "./_components/finalize";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { AiModelId } from "@/lib/ai/models";
import { ProjectPlan } from "@/lib/types";

const STEPS = [
  "Idea Input",
  "Process Mode",
  "AI Interview",
  "AI Plan Output",
  "Budget & Deadline",
  "Publish",
];

export default function CreateProjectPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    idea: "",
    modelId: "gemini-1.5-pro" as AiModelId,
    mode: "fast" as "fast" | "advanced",
    answers: {} as Record<string, string>,
    plan: null as ProjectPlan | null,
    budget: "",
    deadline: undefined as Date | undefined,
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild size="sm" className="gap-2">
          <Link href="/dashboard/client">
            <ArrowLeft className="h-4 w-4" /> Exit Builder
          </Link>
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border">
          <Sparkles className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            AI Project Builder
          </span>
        </div>
        <div className="w-[100px]" /> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 max-w-2xl mx-auto">
        <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-zinc-400">
          <span>{STEPS[currentStep]}</span>
          <span>
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Steps Content */}
      <div className="pt-4">
        {currentStep === 0 && (
          <IdeaInput
            initialValue={formData.idea}
            onNext={(idea, modelId) => {
              updateData({ idea, modelId });
              nextStep();
            }}
          />
        )}

        {currentStep === 1 && (
          <ProcessMode
            selected={formData.mode}
            onNext={(mode) => {
              updateData({ mode });
              nextStep();
            }}
          />
        )}

        {currentStep === 2 && (
          <AiInterview
            idea={formData.idea}
            modelId={formData.modelId}
            onNext={(answers) => {
              updateData({ answers });
              nextStep();
            }}
          />
        )}

        {currentStep === 3 && (
          <AiPlan
            idea={formData.idea}
            answers={formData.answers}
            mode={formData.mode}
            modelId={formData.modelId}
            onNext={(plan) => {
              updateData({ plan });
              nextStep();
            }}
          />
        )}

        {currentStep === 4 && formData.plan && (
          <BudgetDeadline
            plan={formData.plan}
            initialData={{
              budget: formData.budget,
              deadline: formData.deadline,
            }}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
          />
        )}

        {currentStep === 5 && formData.plan && (
          <Finalize
            data={{
              idea: formData.idea,
              mode: formData.mode,
              answers: formData.answers,
              plan: formData.plan,
              budget: formData.budget,
              deadline: formData.deadline,
            }}
            onBack={prevStep}
          />
        )}
      </div>

      {/* Simple Navigation for Back (Internal to builder) */}
      {currentStep > 0 && currentStep < 5 && (
        <div className="flex justify-center pt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Go back to previous step
          </Button>
        </div>
      )}
    </div>
  );
}
