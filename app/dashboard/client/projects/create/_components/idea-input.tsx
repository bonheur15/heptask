"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Upload,
  Pencil,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Brain,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, AiModelId } from "@/lib/ai/models";

interface IdeaInputProps {
  onNext: (idea: string, modelId: AiModelId) => void;
  initialValue: string;
}

export function IdeaInput({ onNext, initialValue }: IdeaInputProps) {
  const [idea, setIdea] = useState(initialValue);
  const [modelId, setModelId] = useState<AiModelId>(
    "gemini-2.5-flash-lite-preview-09-2025",
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          What&apos;s your big idea?
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Describe what you want to build in your own words. Don&apos;t worry about
          technical terms.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Brain className="h-4 w-4" />
            <span>AI Engine:</span>
          </div>
          <Select
            value={modelId}
            onValueChange={(v) => setModelId(v as AiModelId)}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs border-none bg-zinc-100 dark:bg-zinc-900">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} {m.recommended && "(Recommended)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:from-zinc-800 dark:to-zinc-900"></div>
          <Card className="relative border-none shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI Project Assistant is listening...</span>
              </div>
              <Textarea
                placeholder="I want to build a marketplace for artisanal coffee beans with a subscription model..."
                className="min-h-[200px] text-lg resize-none border-none focus-visible:ring-0 p-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-50 dark:border-zinc-900">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                >
                  <Mic className="h-4 w-4" /> Voice Input
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                >
                  <Upload className="h-4 w-4" /> Upload Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                >
                  <Pencil className="h-4 w-4" /> Sketch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            className="rounded-full px-8 gap-2 group"
            disabled={!idea.trim()}
            onClick={() => onNext(idea, modelId)}
          >
            Start AI Analysis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-8">
          <div className="p-4 rounded-xl bg-zinc-50 border dark:bg-zinc-900/50 flex gap-4">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Tip: Be Specific</p>
              <p className="text-xs text-zinc-500">
                Mention who will use the app and what problem it solves.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border dark:bg-zinc-900/50 flex gap-4">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">IP Protection</p>
              <p className="text-xs text-zinc-500">
                Your ideas are protected by our global NDA policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
