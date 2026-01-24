import { getAvailableJobs } from "../../_actions";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Project as ProjectType, User as UserType } from "@/lib/types";

export default async function BrowseJobsPage() {
  const jobs = await getAvailableJobs();

  return (
    <div className="space-y-8 pb-10">
      {/* Search & Filter Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Browse Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Discover new opportunities matched to your expertise.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Search skills, projects, or categories..." className="pl-9 h-11" />
          </div>
          <Button variant="outline" size="lg" className="h-11 gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800">Next.js</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800">UI/UX Design</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800">Mobile Apps</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800">Backend API</Badge>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6">
        {jobs.length > 0 ? jobs.map((job: ProjectType) => (
          <Card key={job.id} className="group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all overflow-hidden border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 uppercase">
                        Enterprise Priority
                      </Badge>
                      {job.ndaRequired && (
                        <Badge variant="outline" className="text-[10px] font-bold tracking-widest bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 uppercase flex gap-1 items-center">
                          <ShieldCheck className="h-2.5 w-2.5" /> NDA Required
                        </Badge>
                      )}
                    </div>
                    <Link href={`/dashboard/talent/jobs/${job.id}`}>
                      <h3 className="text-xl font-bold group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {job.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${job.budget}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest italic">Fixed Budget</p>
                  </div>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" /> Remote
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-3.5 w-3.5" /> {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : "No deadline"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Sparkles className="h-3.5 w-3.5" /> AI Verified Plan
                  </div>
                </div>
              </div>

              <div className="md:w-64 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 border flex items-center justify-center text-[10px] font-bold">
                      {job.client?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{job.client?.name || "N/A"}</p>
                      <p className="text-[10px] text-zinc-400">Verified Client</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">"Excellent communicator, paid 12 talents on time."</p>
                </div>
                
                <Button className="w-full gap-2 rounded-full mt-4" asChild>
                  <Link href={`/dashboard/talent/jobs/${job.id}`}>
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/10 text-center">
            <Search className="h-12 w-12 text-zinc-200 mb-4" />
            <h3 className="text-xl font-bold">No projects found</h3>
            <p className="text-zinc-500 max-w-sm mt-2">We couldn't find any projects matching your current filters. Try broadening your search.</p>
            <Button variant="outline" className="mt-6 rounded-full">Reset Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}