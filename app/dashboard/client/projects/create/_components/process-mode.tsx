"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Settings2, ArrowRight, CheckCircle2 } from "lucide-react";

interface ProcessModeProps {
  onNext: (mode: "fast" | "advanced") => void;
  selected: "fast" | "advanced";
}

export function ProcessMode({ onNext, selected }: ProcessModeProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Choose your process</h2>
        <p className="text-zinc-500 dark:text-zinc-400">How much control do you want over the project details?</p>
      </div>

      <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
        <Card 
          className={`relative cursor-pointer transition-all hover:border-zinc-400 dark:hover:border-zinc-600 ${
            selected === "fast" ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50" : "border-zinc-200 dark:border-zinc-800"
          }`}
          onClick={() => onNext("fast")}
        >
          <CardContent className="p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Fast & Simple</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                The AI makes best-standard assumptions for you. Perfect for common projects and rapid prototyping.
              </p>
            </div>
            <ul className="space-y-2 pt-4">
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2-3 key questions only
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Standard tech stack
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI-generated timeline
              </li>
            </ul>
          </CardContent>
          {selected === "fast" && <div className="absolute top-4 right-4 bg-zinc-900 text-white rounded-full p-1 dark:bg-zinc-50 dark:text-zinc-900"><CheckCircle2 className="h-4 w-4" /></div>}
        </Card>

        <Card 
          className={`relative cursor-pointer transition-all hover:border-zinc-400 dark:hover:border-zinc-600 ${
            selected === "advanced" ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50" : "border-zinc-200 dark:border-zinc-800"
          }`}
          onClick={() => onNext("advanced")}
        >
          <CardContent className="p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Advanced Control</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                Deep dive into every aspect of your project. Define specific tech, deep logic, and complex workflows.
              </p>
            </div>
            <ul className="space-y-2 pt-4">
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Deep AI Interview
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom technical specs
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Specific budget breakdown
              </li>
            </ul>
          </CardContent>
          {selected === "advanced" && <div className="absolute top-4 right-4 bg-zinc-900 text-white rounded-full p-1 dark:bg-zinc-50 dark:text-zinc-900"><CheckCircle2 className="h-4 w-4" /></div>}
        </Card>
      </div>
    </div>
  );
}
