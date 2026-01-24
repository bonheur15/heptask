import { redirect } from "next/navigation";

export default async function ClientWorkRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/client/work/${id}`);
}
