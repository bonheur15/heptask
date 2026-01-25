import { redirect } from "next/navigation";

export default async function ClientPaymentsRedirect() {
  redirect("/dashboard/client/payments");
}
