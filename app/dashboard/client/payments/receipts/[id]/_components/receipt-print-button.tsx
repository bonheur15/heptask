"use client";

import { Button } from "@/components/ui/button";

export function ReceiptPrintButton() {
  return (
    <Button size="sm" variant="outline" onClick={() => window.print()}>
      Download PDF
    </Button>
  );
}
