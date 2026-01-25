import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "client") {
    redirect("/dashboard/client");
  }

  if (session.user.role !== "talent" && session.user.role !== "company") {
    redirect("/dashboard");
  }

  return children;
}
