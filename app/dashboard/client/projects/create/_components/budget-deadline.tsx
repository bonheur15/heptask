"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetDeadlineProps {
  onNext: (data: { budget: string; deadline: Date | undefined }) => void;
  initialData: { budget: string; deadline: Date | undefined };
}

export function BudgetDeadline({ onNext, initialData }: BudgetDeadlineProps) {
  const [budget, setBudget] = useState(initialData.budget);
  const [date, setDate] = useState<Date | undefined>(initialData.deadline);

  const budgetValue = parseInt(budget.replace(/[^0-9]/g, "")) || 0;
  const isLowBudget = budgetValue > 0 && budgetValue < 500;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budget & Timeline</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Set your expectations for project investment and delivery.</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="budget"
                placeholder="e.g. 1500"
                className="pl-9 h-12 text-lg"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal text-lg",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {budgetValue > 0 && (
          <div className={cn(
            "p-6 rounded-2xl border transition-all duration-500",
            isLowBudget 
              ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30" 
              : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30"
          )}>
            <div className="flex gap-4">
              {isLowBudget ? (
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              )}
              <div className="space-y-1">
                <h4 className={cn("font-bold", isLowBudget ? "text-amber-900 dark:text-amber-400" : "text-emerald-900 dark:text-emerald-400")}>
                  {isLowBudget ? "Budget Warning" : "Budget Feasibility: Good"}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {isLowBudget 
                    ? "Your budget seems low for the proposed scope. It might be harder to find top-tier talent, or you may need to reduce the deliverables." 
                    : "Your budget aligns well with the estimated scope and timeline. You are likely to attract high-quality talent."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="w-full sm:w-fit rounded-full px-12 gap-2 group" 
            disabled={!budget || !date}
            onClick={() => onNext({ budget, deadline: date })}
          >
            Review & Publish
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          {isLowBudget && (
            <button 
              className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-4"
              onClick={() => onNext({ budget, deadline: date })}
            >
              I understand, continue anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
