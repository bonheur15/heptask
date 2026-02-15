"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="rounded-full"
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
