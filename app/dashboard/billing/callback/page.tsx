import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { finalizeAccountUpgradePayment } from "../_actions";

type SearchParams = {
  tx_ref?: string;
  status?: string;
  transaction_id?: string;
};

export default async function BillingCallbackPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const txRef = params.tx_ref;
  const status = params.status;
  const transactionId = params.transaction_id;

  if (!txRef || !transactionId) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Missing payment details</CardTitle>
            <CardDescription>The billing callback did not include required transaction data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/billing">Back to Billing & Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    await finalizeAccountUpgradePayment({
      txRef,
      transactionId,
      callbackStatus: status,
    });

    redirect("/dashboard/billing");
  } catch (error) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade payment not confirmed</CardTitle>
            <CardDescription>
              We saved this attempt and you can retry from your billing page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">{error instanceof Error ? error.message : "Unknown error"}</p>
            <Button asChild>
              <Link href="/dashboard/billing">Return to Billing & Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
