"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminDeleteUser, adminResetUserPassword, adminSetUserSuspension, adminUpdateUser } from "../_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Role = "client" | "talent" | "company" | "super_admin";
type Tier = "free" | "pro" | "enterprise";
type TierStatus = "active" | "processing" | "requires_payment";

export function AdminUserRow({
  item,
}: {
  item: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    accountTier: string;
    accountTierStatus: string;
    emailVerified: boolean;
    isSuspended: boolean;
    suspensionReason: string | null;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(item.name);
  const [role, setRole] = useState<Role>((item.role as Role) || "client");
  const [tier, setTier] = useState<Tier>((item.accountTier as Tier) || "free");
  const [tierStatus, setTierStatus] = useState<TierStatus>((item.accountTierStatus as TierStatus) || "active");
  const [emailVerified, setEmailVerified] = useState(item.emailVerified);
  const [newPassword, setNewPassword] = useState("");
  const [suspensionReason, setSuspensionReason] = useState(item.suspensionReason || "");

  const refresh = () => router.refresh();

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{item.email}</p>
        <Badge variant={item.isSuspended ? "destructive" : "secondary"}>
          {item.isSuspended ? "suspended" : "active"}
        </Badge>
      </div>
      <div className="grid gap-2 md:grid-cols-6">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="md:col-span-2" />
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="client">client</SelectItem>
            <SelectItem value="talent">talent</SelectItem>
            <SelectItem value="company">company</SelectItem>
            <SelectItem value="super_admin">super_admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="free">free</SelectItem>
            <SelectItem value="pro">pro</SelectItem>
            <SelectItem value="enterprise">enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierStatus} onValueChange={(v) => setTierStatus(v as TierStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="processing">processing</SelectItem>
            <SelectItem value="requires_payment">requires_payment</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={emailVerified ? "default" : "outline"}
          onClick={() => setEmailVerified((prev) => !prev)}
        >
          {emailVerified ? "Verified" : "Unverified"}
        </Button>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-5">
        <Input
          placeholder="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="md:col-span-2"
        />
        <Input
          placeholder="Suspension reason"
          value={suspensionReason}
          onChange={(e) => setSuspensionReason(e.target.value)}
          className="md:col-span-2"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              startTransition(async () => {
                try {
                  await adminUpdateUser({
                    userId: item.id,
                    name,
                    role,
                    accountTier: tier,
                    accountTierStatus: tierStatus,
                    emailVerified,
                  });
                  toast.success("User updated.");
                  refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Update failed.");
                }
              });
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm"
            variant={item.isSuspended ? "outline" : "secondary"}
            onClick={() => {
              startTransition(async () => {
                try {
                  await adminSetUserSuspension({
                    userId: item.id,
                    suspend: !item.isSuspended,
                    reason: suspensionReason,
                  });
                  toast.success(item.isSuspended ? "User unsuspended." : "User suspended.");
                  refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Suspension failed.");
                }
              });
            }}
            disabled={isPending}
          >
            {item.isSuspended ? "Unsuspend" : "Suspend"}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!newPassword || isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await adminResetUserPassword({
                  userId: item.id,
                  newPassword,
                });
                setNewPassword("");
                toast.success("Password reset.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Password reset failed.");
              }
            });
          }}
        >
          Reset Password
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await adminDeleteUser({ userId: item.id });
                toast.success("User deleted.");
                refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Delete failed.");
              }
            });
          }}
        >
          Delete User
        </Button>
      </div>
    </div>
  );
}
