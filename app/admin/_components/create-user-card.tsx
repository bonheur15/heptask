"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminCreateUser } from "../_actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Role = "client" | "talent" | "company" | "super_admin";
type Tier = "free" | "pro" | "enterprise";

export function CreateUserCard() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client" as Role,
    accountTier: "free" as Tier,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>Create client, talent, company, or super admin accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(value) => setForm((p) => ({ ...p, role: value as Role }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">client</SelectItem>
                <SelectItem value="talent">talent</SelectItem>
                <SelectItem value="company">company</SelectItem>
                <SelectItem value="super_admin">super_admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tier</Label>
            <Select value={form.accountTier} onValueChange={(value) => setForm((p) => ({ ...p, accountTier: value as Tier }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">free</SelectItem>
                <SelectItem value="pro">pro</SelectItem>
                <SelectItem value="enterprise">enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await adminCreateUser(form);
                toast.success("User created.");
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "client",
                  accountTier: "free",
                });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not create user.");
              }
            });
          }}
        >
          Create User
        </Button>
      </CardContent>
    </Card>
  );
}
