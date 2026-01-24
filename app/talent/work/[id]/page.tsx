import { redirect } from "next/navigation";

export default async function TalentWorkRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/talent/work/${id}`);
}
