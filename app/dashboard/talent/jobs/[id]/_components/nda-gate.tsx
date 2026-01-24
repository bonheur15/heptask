"use client";

import { useState } from "react";
import { signNda } from "../_actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, ShieldCheck, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/lib/types";

export function NdaGate({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSign() {
    setIsLoading(true);
    try {
      await signNda(projectId);
      toast.success("NDA Signed. Access granted.");
    } catch (error) {
      toast.error("Failed to sign NDA. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-500">
      <Card className="max-w-2xl w-full border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-800" />
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              NDA Required for Full Access
            </CardTitle>
            <CardDescription className="text-zinc-500">
              The client has protected this project&apos;s intellectual
              property. You must sign the standard Heptadev NDA to view full
              details and apply.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 space-y-6">
          <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <FileText className="h-3 w-3" /> Agreement Summary
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              &quot;By clicking sign, you agree to keep all project information,
              including business logic, technical plans, and shared files,
              strictly confidential. You may not share these details with third
              parties or use them for personal projects without the
              client&apos;s explicit consent.&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Legally Binding
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30">
              <Lock className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Secure Audit Log
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <Button
            className="w-full h-12 rounded-full text-base font-bold shadow-lg"
            size="lg"
            onClick={handleSign}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                Agreement...
              </>
            ) : (
              "Sign & Access Project Details"
            )}
          </Button>
        </CardFooter>
      </Card>
      <p className="mt-6 text-xs text-zinc-400">
        Already signed an NDA with this client? It will be automatically
        applied.
      </p>
    </div>
  );
}
