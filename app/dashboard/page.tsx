import { auth } from "@/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, CheckCircle2, DollarSign, Star, User } from "lucide-react";
import { ProfileForm } from "./_components/profile-form";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;
  const { user } = session;

  // Mock data for the advanced profile view
  const stats = [
    { label: "Active Projects", value: "12", icon: Briefcase, color: "text-emerald-600" },
    { label: "Total Earnings", value: "$4,250", icon: DollarSign, color: "text-amber-600" },
    { label: "Success Rate", value: "98%", icon: CheckCircle2, color: "text-blue-600" },
    { label: "Rating", value: "4.9/5", icon: Star, color: "text-amber-500" },
  ];

  const recentActivity = [
    { id: "1", type: "Milestone", project: "E-commerce Redesign", status: "Completed", date: "2 hours ago", amount: "$500" },
    { id: "2", type: "Payment", project: "Mobile App API", status: "Pending", date: "5 hours ago", amount: "$1,200" },
    { id: "3", type: "Review", project: "Brand Identity", status: "Received", date: "1 day ago", amount: "-" },
    { id: "4", type: "Project", project: "SaaS Dashboard", status: "Active", date: "3 days ago", amount: "$2,800" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm dark:border-zinc-800">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xl">{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{user.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 capitalize">{user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6">
              <div className={`mr-4 rounded-full bg-zinc-100 p-3 dark:bg-zinc-900 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You have 4 updates this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.type}</TableCell>
                        <TableCell>{activity.project}</TableCell>
                        <TableCell>
                          <Badge variant={activity.status === "Completed" ? "default" : "secondary"}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell className="text-right">{activity.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {user.bio || "No bio provided yet. Add a bio to tell others about your skills and experience."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Next.js</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind</Badge>
                  <Badge variant="outline">UI/UX</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                    <span>Member since 2024</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-zinc-400" />
                    <span className="capitalize">{user.role} Account</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and bio.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Separator() {
  return <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />;
}
