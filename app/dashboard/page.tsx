import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "client") {
    redirect("/dashboard/client");
  }

  if (session.user.role === "company") {
    redirect("/company/dashboard");
  }

  if (session.user.role === "super_admin") {
    redirect("/admin");
  }

  redirect("/dashboard/talent");
}
