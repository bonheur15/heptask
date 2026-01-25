import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralProfile } from "./_components/general-profile";
import { SecuritySettings } from "./_components/security-settings";
import { NotificationSettings } from "./_components/notification-settings";
import { User as LucideUser, Shield, Bell } from "lucide-react";
import { ProfileForm } from "../_components/profile-form";
import { User as UserType } from "@/lib/types";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = session.user as UserType;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your profile, security preferences, and notification settings.
        </p>
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
        <TabsContent value="edit">
          <ProfileForm user={currentUser} />
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
