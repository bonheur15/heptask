"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Workflow,
  Pencil,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AiModelId } from "@/lib/ai/models";
import { ProjectPlan } from "@/lib/types";

type MilestoneItem = ProjectPlan["milestones"][number];
type TechnicalSpecItem = ProjectPlan["technicalSpecs"][number];
type RiskItem = ProjectPlan["risks"][number];
type ObjectListField = "milestones" | "technicalSpecs" | "risks";
type ObjectListItemMap = {
  milestones: MilestoneItem;
  technicalSpecs: TechnicalSpecItem;
  risks: RiskItem;
};
type ArrayField = {
  [K in keyof ProjectPlan]: ProjectPlan[K] extends Array<unknown> ? K : never
}[keyof ProjectPlan];

interface AiPlanProps {
  idea: string;
  answers: Record<string, string>;
  mode: "fast" | "advanced";
  modelId: AiModelId;
  onNext: (plan: ProjectPlan) => void;
}

export function AiPlan({ idea, answers, mode, modelId, onNext }: AiPlanProps) {
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
        <p className="text-zinc-500 font-medium text-center">
          AI is crafting your custom project plan,
          <br />
          milestones, and technical architecture...
        </p>
      </div>
    );
  }

  const updateField = <K extends keyof ProjectPlan>(field: K, value: ProjectPlan[K]) => {
    if (!plan) return; // Should not happen after initial load
    setPlan((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleListItemChange = (
    field: "deliverables" | "successMetrics",
    index: number,
    value: string,
  ) => {
    if (!plan) return;
    const newList = [...plan[field]];
    newList[index] = value;
    updateField(field, newList);
  };

  const handleObjectListItemChange = <
    F extends ObjectListField,
    K extends keyof ObjectListItemMap[F],
  >(
    field: F,
    index: number,
    key: K,
    value: ObjectListItemMap[F][K],
  ) => {
    if (!plan) return;
    const newList = [...plan[field]] as ObjectListItemMap[F][];
    newList[index] = { ...newList[index], [key]: value };
    updateField(field, newList as ProjectPlan[F]);
  };

  const addItem = <K extends ArrayField>(
    field: K,
    defaultValue: ProjectPlan[K] extends Array<infer U> ? U : never,
  ) => {
    if (!plan) return;
    updateField(field, [...(plan[field] as ProjectPlan[K]), defaultValue]);
  };

  const removeItem = <K extends ArrayField>(field: K, index: number) => {
    if (!plan) return;
    updateField(
      field,
      (plan[field] as ProjectPlan[K]).filter((_, i) => i !== index) as ProjectPlan[K],
    );
  };
  if (!plan) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="text-left space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Your AI-Powered Roadmap
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Review and refine the comprehensive strategic plan.
          </p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          className="gap-2 rounded-full"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" /> Save Plan
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" /> Edit Plan
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Summary & Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="h-2 bg-zinc-900 dark:bg-zinc-100" />
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              {isEditing ? (
                <Textarea
                  value={plan.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  className="mt-2 min-h-[150px] resize-none"
                />
              ) : (
                <CardDescription className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {plan.summary}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <CheckCircle2 className="h-4 w-4" /> Core Deliverables
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addItem("deliverables", "New Deliverable")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {plan.deliverables.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border relative group"
                    >
                      <div className="h-5 w-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center shrink-0">
                        <span className="text-[10px]">{i + 1}</span>
                      </div>
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={(e) =>
                              handleListItemChange(
                                "deliverables",
                                i,
                                e.target.value,
                              )
                            }
                            className="h-8 py-0 text-sm border-none bg-transparent focus-visible:ring-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-400 hover:text-red-500"
                            onClick={() => removeItem("deliverables", i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{item}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <Workflow className="h-4 w-4" /> Strategic Milestones
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        addItem("milestones", {
                          title: "New Milestone",
                          description: "",
                          duration: "1 week",
                        })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {plan.milestones.map((m: MilestoneItem, i: number) => (
                    <div
                      key={i}
                      className="relative pl-6 border-l-2 border-zinc-100 dark:border-zinc-800 pb-4 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-zinc-900 dark:bg-zinc-900 dark:border-zinc-50" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          {isEditing ? (
                            <Input
                              value={m.title}
                              onChange={(e) =>
                                handleObjectListItemChange(
                                  "milestones",
                                  i,
                                  "title",
                                  e.target.value,
                                )
                              }
                              className="h-7 text-sm font-bold bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                          ) : (
                            <h5 className="font-bold text-sm">{m.title}</h5>
                          )}
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <Input
                                value={m.duration}
                                onChange={(e) =>
                                  handleObjectListItemChange(
                                    "milestones",
                                    i,
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                className="h-6 w-20 text-[10px] px-2"
                              />
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {m.duration}
                              </Badge>
                            )}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                onClick={() => removeItem("milestones", i)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {isEditing ? (
                          <Textarea
                            value={m.description}
                            onChange={(e) =>
                              handleObjectListItemChange(
                                "milestones",
                                i,
                                "description",
                                e.target.value,
                              )
                            }
                            className="text-xs p-2 min-h-[60px]"
                          />
                        ) : (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {m.description}
                          </p>
                        )}
                      </div>
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
                <span className="font-bold uppercase tracking-wider text-xs">
                  AI Technical Mode
                </span>
              </div>
              {showTech ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showTech && (
              <div className="p-6 rounded-2xl bg-zinc-950 text-zinc-50 space-y-6 animate-in fade-in slide-in-from-top-2 border shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400 font-mono italic">
                    System Architecture Specs
                  </p>
                  <div className="flex gap-2">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-zinc-400"
                        onClick={() =>
                          addItem("technicalSpecs", {
                            category: "Category",
                            tech: "Tool",
                            reason: "Reason",
                          })
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Spec
                      </Button>
                    )}
                    <Code2 className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {plan.technicalSpecs.map((spec: TechnicalSpecItem, i: number) => (
                    <div
                      key={i}
                      className="relative group space-y-2 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
                    >
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem("technicalSpecs", i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      {isEditing ? (
                        <>
                          <Input
                            value={spec.category}
                            onChange={(e) =>
                              handleObjectListItemChange(
                                "technicalSpecs",
                                i,
                                "category",
                                e.target.value,
                              )
                            }
                            className="h-6 text-[9px] uppercase font-bold bg-transparent border-zinc-800"
                          />
                          <Input
                            value={spec.tech}
                            onChange={(e) =>
                              handleObjectListItemChange(
                                "technicalSpecs",
                                i,
                                "tech",
                                e.target.value,
                              )
                            }
                            className="h-7 text-sm font-bold bg-transparent border-zinc-800"
                          />
                          <Textarea
                            value={spec.reason}
                            onChange={(e) =>
                              handleObjectListItemChange(
                                "technicalSpecs",
                                i,
                                "reason",
                                e.target.value,
                              )
                            }
                            className="text-[10px] p-2 min-h-[40px] bg-transparent border-zinc-800"
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            {spec.category}
                          </p>
                          <p className="text-sm font-bold text-zinc-200">
                            {spec.tech}
                          </p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            {spec.reason}
                          </p>
                        </>
                      )}
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
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <AlertTriangle className="h-4 w-4" /> Risk Assessment
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    addItem("risks", { risk: "New Risk", mitigation: "" })
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.risks.map((r: RiskItem, i: number) => (
                <div key={i} className="group relative space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={r.risk}
                          onChange={(e) =>
                            handleObjectListItemChange(
                              "risks",
                              i,
                              "risk",
                              e.target.value,
                            )
                          }
                          className="h-7 text-xs font-bold"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400"
                          onClick={() => removeItem("risks", i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={r.mitigation}
                        onChange={(e) =>
                          handleObjectListItemChange(
                            "risks",
                            i,
                            "mitigation",
                            e.target.value,
                          )
                        }
                        className="text-[10px] p-2 min-h-[40px]"
                        placeholder="Mitigation strategy..."
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold">{r.risk}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        Mitigation: {r.mitigation}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Target className="h-4 w-4" /> Success Metrics
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => addItem("successMetrics", "New Metric")}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.successMetrics.map((m: string, i: number) => (
                  <li
                    key={i}
                    className="group flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug"
                  >
                    <span className="text-zinc-900 dark:text-white mt-1 shrink-0">
                      •
                    </span>
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={m}
                          onChange={(e) =>
                            handleListItemChange(
                              "successMetrics",
                              i,
                              e.target.value,
                            )
                          }
                          className="h-7 text-[10px] py-0"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-zinc-400"
                          onClick={() => removeItem("successMetrics", i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span>{m}</span>
                    )}
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
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                Total Estimated Timeline
              </p>
              {isEditing ? (
                <Input
                  value={plan.timeline}
                  onChange={(e) => updateField("timeline", e.target.value)}
                  className="h-8 bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black border-none"
                />
              ) : (
                <p className="text-3xl font-bold">{plan.timeline}</p>
              )}
              <p className="text-[10px] opacity-60 italic pt-2">
                Based on current analysis of scope complexity.
              </p>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full rounded-full h-14 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            onClick={() => onNext(plan)}
            disabled={isEditing}
          >
            {isEditing ? "Save Plan to Continue" : "Confirm Plan & Set Budget"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          {isEditing && (
            <p className="text-center text-[10px] text-zinc-500 italic">
              Exit edit mode to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
