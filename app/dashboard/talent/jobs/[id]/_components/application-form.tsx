"use client";

import { useState } from "react";
import { submitApplication, ProposedMilestone } from "../_actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Sparkles, 
  DollarSign, 
  Clock, 
  Send, 
  Loader2, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  Info,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function ApplicationForm({ projectId, initialBudget }: { projectId: string; initialBudget: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [links, setLinks] = useState("");
  const [milestones, setMilestones] = useState<ProposedMilestone[]>([
    { id: "1", title: "Project Kickoff & Research", amount: "", dueDate: null }
  ]);

  const FEE_PERCENTAGE = 0.10; // 10% Platform fee
  const totalBudget = parseFloat(initialBudget) || 0;
  
  // Calculate total allocated in milestones
  const totalAllocated = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const remainingBudget = totalBudget - totalAllocated;
  const allocationPercentage = Math.min((totalAllocated / totalBudget) * 100, 100);
  const isOverBudget = totalAllocated > totalBudget;
  const isFullyAllocated = totalAllocated === totalBudget;

  const platformFee = totalBudget * FEE_PERCENTAGE;
  const netEarnings = totalBudget - platformFee;

  const addMilestone = () => {
    setMilestones([...milestones, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: "", 
      amount: "",
      dueDate: null
    }]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (
    id: string,
    field: keyof ProposedMilestone,
    value: string | Date | null,
  ) => {
    // If updating due date, ensure it's not after the project deadline
    if (field === "dueDate" && value instanceof Date && deadline && value > deadline) {
      toast.error("Milestone date cannot be after the project deadline.");
      return;
    }
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!deadline) {
      toast.error("Please select a proposed completion date.");
      return;
    }

    if (!isFullyAllocated) {
      toast.error(isOverBudget 
        ? `You have exceeded the budget by $${(totalAllocated - totalBudget).toFixed(2)}` 
        : `Please allocate the remaining $${remainingBudget.toFixed(2)} across your milestones.`
      );
      return;
    }

    // Final check for dates
    const invalidMilestone = milestones.find(m => !m.dueDate || m.dueDate > deadline);
    if (invalidMilestone) {
      toast.error(`Please set valid dates for all milestones (not after ${format(deadline, "PPP")}).`);
      return;
    }

    setIsLoading(true);
    try {
      await submitApplication({
        projectId,
        proposal,
        budget: initialBudget,
        timeline: format(deadline, "PPP"),
        milestones,
        links,
      });
      toast.success("Proposal submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-zinc-900 to-zinc-500 dark:from-emerald-600 dark:via-zinc-100 dark:to-zinc-800" />
        <CardHeader className="pb-8">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="h-4 w-4" /> Professional Proposal
          </div>
          <CardTitle className="text-3xl">Submit Your Bid</CardTitle>
          <CardDescription className="text-base">
            Break down your strategy, set milestones, and define your terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: The Pitch */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4 border-zinc-100 dark:border-zinc-800">
                <Info className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">The Pitch</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposal" className="text-sm font-bold">Why are you the best fit?</Label>
                <Textarea 
                  id="proposal"
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Describe your unique approach, relevant experience, and how you'll ensure the project's success..."
                  className="min-h-[200px] text-base resize-none border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links" className="text-sm font-bold flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5" /> Relevant Work / Portfolio Links
                </Label>
                <Input 
                  id="links"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="https://github.com/..., https://behance.net/..."
                  className="border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            {/* Section 2: Budget & Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4 border-zinc-100 dark:border-zinc-800">
                <DollarSign className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Fixed Budget & Timeline</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-bold">Project Budget (Fixed)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      id="budget" 
                      readOnly
                      value={initialBudget}
                      className="pl-9 h-12 text-lg font-bold bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">This project has a fixed budget set by the client.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Proposed Completion Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        type="button"
                        className={cn(
                          "w-full h-12 justify-start text-left font-medium text-lg border-zinc-200 dark:border-zinc-800",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={(date) => {
                          setDeadline(date);
                          // Reset milestone dates if they now exceed the new deadline
                          setMilestones(prev => prev.map(m => 
                            m.dueDate && date && m.dueDate > date ? { ...m, dueDate: null } : m
                          ));
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Earnings Card */}
              {totalBudget > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Service Fee (10%)</span>
                      <span className="text-red-500 font-medium">-${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold">You'll Receive</span>
                      <span className="text-xl font-bold text-emerald-600">${netEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Milestone Breakdown with Budget Tracker */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2 border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Proposed Milestones</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="h-7 text-[10px] uppercase font-bold gap-1 rounded-full">
                  <Plus className="h-3 w-3" /> Add Step
                </Button>
              </div>

              {/* Budget Tracker Widget */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300",
                isOverBudget 
                  ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30" 
                  : isFullyAllocated 
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30"
                    : "bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isOverBudget ? <AlertCircle className="h-4 w-4 text-red-500" /> : isFullyAllocated ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Info className="h-4 w-4 text-zinc-400" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isOverBudget ? "Budget Exceeded" : isFullyAllocated ? "Budget Fully Allocated" : "Budget Allocation"}
                    </span>
                  </div>
                  <span className="text-sm font-bold">${totalAllocated.toFixed(2)} / ${totalBudget.toFixed(2)}</span>
                </div>
                <Progress value={allocationPercentage} className={cn("h-1.5", isOverBudget ? "[&>div]:bg-red-500" : isFullyAllocated ? "[&>div]:bg-emerald-500" : "")} />
                {!isFullyAllocated && !isOverBudget && (
                  <p className="text-[10px] text-zinc-500 mt-2 italic">Remaining to allocate: ${remainingBudget.toFixed(2)}</p>
                )}
                {isOverBudget && (
                  <p className="text-[10px] text-red-600 mt-2 font-bold">Please reduce milestone amounts by ${Math.abs(remainingBudget).toFixed(2)}</p>
                )}
              </div>
              
              <div className="space-y-3">
                {milestones.map((m, index) => (
                  <div key={m.id} className="flex gap-3 group animate-in slide-in-from-left-2 duration-300">
                    <div className="flex flex-col items-center pt-3 gap-2">
                      <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>
                      <div className="w-px flex-1 bg-zinc-100 dark:bg-zinc-800 group-last:bg-transparent" />
                    </div>
                    <div className="flex-1 grid gap-3 sm:grid-cols-12 pb-4">
                      <div className="sm:col-span-6">
                        <Input 
                          placeholder="Milestone title (e.g. UI Design Complete)" 
                          value={m.title}
                          onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3 relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <Input 
                          type="number"
                          placeholder="Amount" 
                          value={m.amount}
                          onChange={(e) => updateMilestone(m.id, "amount", e.target.value)}
                          className={cn("h-10 pl-8 text-sm", isOverBudget && "border-red-300 focus:ring-red-500")}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Popover>
                          <PopoverTrigger asChild disabled={!deadline}>
                            <Button 
                              variant="outline" 
                              type="button" 
                              size="sm" 
                              className={cn(
                                "w-full h-10 text-xs justify-start px-2 font-normal truncate",
                                !deadline && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {m.dueDate ? format(m.dueDate, "MMM d") : "Due date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={m.dueDate ?? undefined}
                              onSelect={(date) => updateMilestone(m.id, "dueDate", date ?? null)}
                              disabled={(date) => date < new Date() || (deadline ? date > deadline : false)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeMilestone(m.id)}
                          className="h-10 w-10 text-zinc-300 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!deadline && (
                <p className="text-[10px] text-amber-600 font-medium">Please set a Proposed Completion Date above first to schedule milestones.</p>
              )}
            </div>

            <div className="pt-6 flex flex-col items-center gap-4">
              <Button 
                type="submit" 
                size="lg"
                className={cn(
                  "w-full h-14 rounded-full font-bold shadow-xl gap-2 text-lg transition-all",
                  !isFullyAllocated || isOverBudget ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"
                )}
                disabled={isLoading || isOverBudget || !isFullyAllocated}
              >
                {isLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Finalizing Application...</>
                ) : (
                  <><Send className="h-5 w-5" /> Submit Official Proposal</>
                )}
              </Button>
              <p className="text-[10px] text-zinc-400 text-center max-w-xs leading-relaxed">
                {!isFullyAllocated ? "Your milestones must sum up exactly to the project budget to continue." : "By submitting, you agree to the terms of the signed NDA."}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
