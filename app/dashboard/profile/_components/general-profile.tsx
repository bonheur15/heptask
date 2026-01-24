"use client";

import { useState } from "react";
import { updateProfile } from "../../_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building, Globe, MapPin, User as UserIcon, Pencil } from "lucide-react";
import { User } from "../../../../lib/types";

export function GeneralProfile({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
      website: formData.get("website") as string,
      skills: formData.get("skills") as string,
      companyName: formData.get("companyName") as string,
    };

    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-500" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <CardDescription>
            Update your public profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue={user.email} disabled className="bg-zinc-50 dark:bg-zinc-900" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={user.bio || ""} 
              placeholder="Tell us about yourself..." 
              className="min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-zinc-500" />
            <CardTitle>Role Specific Details</CardTitle>
          </div>
          <CardDescription>
            Information tailored to your role as a {user.role}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {user.role === "company" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-zinc-400" />
                  <Label htmlFor="companyName">Company Name</Label>
                </div>
                <Input id="companyName" name="companyName" defaultValue={user.companyName || ""} placeholder="Your Company Ltd" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="location">Location</Label>
              </div>
              <Input id="location" name="location" defaultValue={user.location || ""} placeholder="City, Country" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="website">Website / Portfolio</Label>
              </div>
              <Input id="website" name="website" defaultValue={user.website || ""} placeholder="https://yourwebsite.com" />
            </div>
            {(user.role === "talent" || user.role === "company") && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Skills & Expertise</Label>
                <Input id="skills" name="skills" defaultValue={user.skills || ""} placeholder="e.g. Next.js, UI Design, Marketing (Comma separated)" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-fit">
          {isLoading ? "Saving changes..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
