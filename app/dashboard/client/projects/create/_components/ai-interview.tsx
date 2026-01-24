"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { generateAiQuestions } from "../_actions";
import { Sparkles, ArrowRight, SkipForward, Loader2 } from "lucide-react";
import { AiModelId } from "@/lib/ai/models";

interface AiInterviewProps {
  idea: string;
  modelId: AiModelId;
  onNext: (answers: Record<string, string>) => void;
}

export function AiInterview({ idea, modelId, onNext }: AiInterviewProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function fetchQuestions() {
      const q = await generateAiQuestions(idea, modelId);
      setQuestions(q);
      setLoading(false);
    }
    fetchQuestions();
  }, [idea, modelId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Sparkles className="h-12 w-12 text-zinc-200 animate-pulse" />
          <Loader2 className="h-12 w-12 text-zinc-900 animate-spin absolute inset-0 dark:text-zinc-50" />
        </div>
        <p className="text-zinc-500 font-medium">AI is analyzing your idea and preparing questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleContinue = () => {
    const newAnswers = { ...answers, [currentQuestion.id]: inputValue };
    setAnswers(newAnswers);
    setInputValue("");
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onNext(newAnswers);
    }
  };

  const handleSkip = () => {
    const newAnswers = { ...answers, [currentQuestion.id]: "AI Assumption (Skipped)" };
    setAnswers(newAnswers);
    setInputValue("");

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onNext(newAnswers);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold uppercase tracking-wider dark:bg-zinc-900">
            <Sparkles className="h-3 w-3" /> Question {currentIdx + 1} of {questions.length}
          </div>
          <h2 className="text-3xl font-bold">{currentQuestion.question}</h2>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="answer" className="sr-only">Your Answer</Label>
              <Input
                id="answer"
                autoFocus
                placeholder={currentQuestion.placeholder}
                className="text-lg h-14"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && handleContinue()}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="ghost" className="gap-2" onClick={handleSkip}>
                <SkipForward className="h-4 w-4" /> Skip & let AI assume
              </Button>
              <Button 
                size="lg" 
                className="gap-2 rounded-full px-8" 
                disabled={!inputValue.trim()}
                onClick={handleContinue}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-400">
          Tip: You can change these details later in the project plan review.
        </p>
      </div>
    </div>
  );
}
