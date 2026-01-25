import { redirect } from "next/navigation";

export default async function TalentPaymentsRedirect() {
  redirect("/dashboard/talent/payments");
}
