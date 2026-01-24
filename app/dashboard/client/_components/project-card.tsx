"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ArrowRight, MoreVertical } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string | null;
    deadline: Date | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <Card className="group transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Badge className={statusColors[project.status] || ""}>
            {project.status.toUpperCase()}
          </Badge>
          <CardTitle className="text-lg font-bold group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            {project.title}
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            <DollarSign className="h-4 w-4" />
            <span>{project.budget || "No budget set"}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            <Calendar className="h-4 w-4" />
            <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="ghost" size="sm" className="ml-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          <Link href={`/dashboard/projects/${project.id}`}>
            View Details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
