import { getProjectDetails, initializeMilestones } from "./_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  DollarSign,
  FileUp,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PayAndPublishButton } from "./_components/pay-and-publish-button";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let project = await getProjectDetails(id);

  // Initialize milestones if they don't exist
  if (project.milestones.length === 0) {
    await initializeMilestones(id);
    // Fetch again to get the newly created milestones for the current render
    project = await getProjectDetails(id);
  }

  const completedMilestones = project.milestones.filter(m => m.status === "approved").length;
  const progress = project.milestones.length > 0 ? (completedMilestones / project.milestones.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Project Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/client" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">Projects</Link>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Details</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize">
              {project.status}
            </Badge>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.status === "draft" ? (
            <PayAndPublishButton projectId={project.id} />
          ) : null}
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Messages
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <ShieldAlert className="h-4 w-4" /> Open Dispute
          </Button>
        </div>
      </div>

      {/* Quick Stats & Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Budget</p>
              <p className="text-xl font-bold">${project.budget}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Deadline</p>
              <p className="text-xl font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Project Progress</p>
              <span className="text-xs font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 gap-8">
          <TabsTrigger value="overview" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">Milestones ({project.milestones.length})</TabsTrigger>
          <TabsTrigger value="applicants" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">Applicants ({project.applicants.length})</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">Files & Escrow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
           <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Project Roadmap</CardTitle>
                    <CardDescription>Comprehensive plan generated by Heptadev AI.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                      {JSON.parse(project.plan || "{}").summary}
                    </p>
                    <div className="space-y-2 pt-4">
                      <h4 className="text-xs font-bold uppercase text-zinc-500">Key Deliverables</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {JSON.parse(project.plan || "{}").deliverables?.map((d: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border text-xs">
                            <Sparkles className="h-3 w-3 text-zinc-400" />
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">NDA Protection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">NDA Required for all applicants</p>
                    </div>
                    <p className="text-xs text-zinc-500">Your sensitive IP and files are hidden until the talent signs a legally binding NDA.</p>
                  </CardContent>
                </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Track progress and release payments upon completion.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-100 before:to-transparent dark:before:via-zinc-800">
                {project.milestones.map((m, i) => (
                  <div key={m.id} className="relative flex items-start gap-6 pl-12 group">
                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 group-last:border-emerald-500">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 space-y-1 py-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">{m.title}</h4>
                        <Badge variant={m.status === "completed" ? "default" : "secondary"}>
                          {m.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.description}</p>
                      <div className="flex items-center gap-4 pt-2 text-xs font-medium text-zinc-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due: N/A</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Amount: {m.amount || "Not set"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants" className="mt-0">
           <Card>
            <CardHeader>
              <CardTitle>Proposals ({project.applicants.length})</CardTitle>
              <CardDescription>Talents interested in working on your project.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talent</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.applicants.length > 0 ? project.applicants.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={app.user.image || ""} />
                            <AvatarFallback>{app.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <span className="text-sm font-bold leading-none">{app.user.name}</span>
                            <span className="text-xs text-zinc-500">Rating: 4.9 (24 jobs)</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${app.budget}</TableCell>
                      <TableCell>{app.timeline}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === "accepted" ? "default" : "secondary"}>
                          {app.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/client/projects/${id}/applicants/${app.id}`}>
                            Review Proposal <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                        No applicants yet. Keep your project active to attract talent.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-0 space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Project Documents</CardTitle>
                    <CardDescription>Files shared by you and the talent.</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <FileUp className="h-4 w-4" /> Upload
                  </Button>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {project.files.length > 0 ? project.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                           <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-zinc-400" />
                              <div>
                                <p className="text-sm font-bold">{file.name}</p>
                                <p className="text-[10px] text-zinc-500">{file.size} • Uploaded by {file.uploader.name}</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                          No files uploaded yet.
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Escrow Balance</CardTitle>
                  <CardDescription>Secure payments for this project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex flex-col items-center text-center space-y-2">
                      <DollarSign className="h-8 w-8 text-emerald-500" />
                      <p className="text-3xl font-bold">${project.budget}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Currently in Escrow</p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Milestone 1 Release</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Service Fee (5%)</span>
                        <span className="font-bold">${(parseFloat(project.budget || "0") * 0.05).toFixed(2)}</span>
                      </div>
                   </div>
                </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
