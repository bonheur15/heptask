import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralProfile } from "./_components/general-profile";
import { SecuritySettings } from "./_components/security-settings";
import { NotificationSettings } from "./_components/notification-settings";
import { Bell, Calendar, Mail, MapPin, Shield, User as LucideUser } from "lucide-react";
import { User as UserType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = session.user as UserType;
  const skillTags = (currentUser.skills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const profileChecks = [
    { label: "Display name", value: currentUser.name },
    { label: "Profile photo", value: currentUser.image },
    { label: "Bio", value: currentUser.bio },
    { label: "Location", value: currentUser.location },
    { label: "Website", value: currentUser.website },
    ...(currentUser.role === "company"
      ? [{ label: "Company name", value: currentUser.companyName }]
      : []),
    ...(currentUser.role === "talent" || currentUser.role === "company"
      ? [{ label: "Skills", value: currentUser.skills }]
      : []),
  ];

  const completedChecks = profileChecks.filter((item) => {
    if (typeof item.value !== "string") {
      return Boolean(item.value);
    }

    return item.value.trim().length > 0;
  });
  const completionPercent = Math.round((completedChecks.length / profileChecks.length) * 100);
  const missingChecks = profileChecks.filter((item) => !completedChecks.includes(item));

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your profile, security preferences, and notification settings.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>How your profile appears to clients and teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-zinc-200 dark:border-zinc-800">
                  <AvatarImage src={currentUser.image || ""} />
                  <AvatarFallback>{currentUser.name?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{currentUser.name}</p>
                    <Badge variant="outline" className="capitalize">{currentUser.role}</Badge>
                  </div>
                  <p className="text-sm text-zinc-500">{currentUser.email}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
                {currentUser.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{currentUser.location}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {currentUser.bio ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {currentUser.bio}
              </p>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">
                Add a short bio to introduce your experience and preferred project style.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
                  <Mail className="h-4 w-4" />
                  Contact
                </div>
                <p className="text-sm font-semibold">Primary Email</p>
                <p className="text-xs text-zinc-500">{currentUser.email}</p>
                {currentUser.website ? (
                  <p className="text-xs text-zinc-500">Website: {currentUser.website}</p>
                ) : null}
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
                  <LucideUser className="h-4 w-4" />
                  Role Snapshot
                </div>
                <p className="text-sm font-semibold">Current Role</p>
                <p className="text-xs text-zinc-500 capitalize">{currentUser.role}</p>
                {currentUser.companyName ? (
                  <p className="text-xs text-zinc-500">{currentUser.companyName}</p>
                ) : null}
              </div>
            </div>

            {(skillTags.length > 0) ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-zinc-400">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Finish your profile to unlock more trust.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Progress</span>
                <span className="font-semibold">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} />
              {missingChecks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">Missing</p>
                  <div className="flex flex-wrap gap-2">
                    {missingChecks.map((item) => (
                      <Badge key={item.label} variant="outline">{item.label}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-600">All profile essentials completed.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 w-full justify-start h-12 p-1 gap-2 border-b rounded-none bg-transparent">
          <TabsTrigger value="profile" className="rounded-md px-4 py-2 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900">
            <LucideUser className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-md px-4 py-2 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-md px-4 py-2 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GeneralProfile user={currentUser} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
