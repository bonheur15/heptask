"use client";

import { useState } from "react";
import { setRole } from "../_actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building2, User } from "lucide-react";
import { toast } from "sonner";

const roles = [
  {
    id: "client",
    title: "Client",
    description: "I have ideas and want to hire talent to build them.",
    icon: User,
  },
  {
    id: "talent",
    title: "Talent",
    description: "I have skills and want to find work and projects.",
    icon: Briefcase,
  },
  {
    id: "company",
    title: "Company",
    description: "We are a team or agency providing professional services.",
    icon: Building2,
  },
] as const;

export function RoleSelection() {
  const [selected, setSelected] = useState<typeof roles[number]["id"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setIsLoading(true);
    try {
      await setRole(selected);
      toast.success("Role selected successfully!");
    } catch (error) {
      toast.error("Failed to set role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Choose Your Path</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Select how you want to use Heptadev. You can update this later in your profile settings.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`relative cursor-pointer overflow-hidden transition-all hover:border-zinc-400 dark:hover:border-zinc-600 ${
                selected === role.id ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50" : "border-zinc-200 dark:border-zinc-800"
              }`}
              onClick={() => setSelected(role.id)}
            >
              <CardHeader className="space-y-4">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 ${
                  selected === role.id ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
                }`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{role.description}</CardDescription>
              </CardContent>
              {selected === role.id && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-50 dark:text-black">
                  ✓
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-xs"
            disabled={!selected || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
