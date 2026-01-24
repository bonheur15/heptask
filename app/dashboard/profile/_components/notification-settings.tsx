"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Zap } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-zinc-500" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how you receive updates and alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Email Notifications</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Project Updates</Label>
                    <p className="text-sm text-zinc-500">Receive emails about your active project milestones and status changes.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex gap-3">
                  <MessageSquare className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Messages</Label>
                    <p className="text-sm text-zinc-500">Get notified when you receive a new message from a client or talent.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Marketing & News</Label>
                    <p className="text-sm text-zinc-500">Stay up to date with the latest features and platform updates.</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Push Notifications</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Browser Notifications</Label>
                <p className="text-sm text-zinc-500">Receive real-time alerts in your browser when you are online.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
