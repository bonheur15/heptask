import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PaymentsRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "client") {
    redirect("/dashboard/client/payments");
  }

  redirect("/dashboard/talent");
}
