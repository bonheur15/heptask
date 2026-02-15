import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { finalizePublishedProjectPayment } from "../_actions";

type SearchParams = {
  tx_ref?: string;
  status?: string;
  transaction_id?: string;
};

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const txRef = params.tx_ref;
  const status = params.status;
  const transactionId = params.transaction_id;

  if (!txRef || !transactionId) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment details missing</CardTitle>
            <CardDescription>The callback did not include a valid transaction reference.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/client/projects/create">Back to project builder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    const result = await finalizePublishedProjectPayment({
      txRef,
      transactionId,
      callbackStatus: status,
    });

    if (result.projectId) {
      redirect(`/dashboard/client/projects/${result.projectId}`);
    }
  } catch (error) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment verification failed</CardTitle>
            <CardDescription>
              We could not confirm this Flutterwave payment yet. The payment record is kept for manual follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">{error instanceof Error ? error.message : "Unknown error"}</p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard/client/projects/create">Return to builder</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/client/payments">Open payments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
