"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { adminUpdateProject } from "../_actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";

type ProjectStatus = "draft" | "active" | "maintenance" | "completed" | "cancelled";

export function AdminProjectRow({
  item,
}: {
  item: {
    id: string;
    title: string;
    status: string;
    budget: string | null;
    client?: { email: string } | null;
    clientId: string;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ProjectStatus>(item.status as ProjectStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{item.title}</p>
      </TableCell>
      <TableCell>{item.client?.email ?? item.clientId}</TableCell>
      <TableCell>
        <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
          <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">draft</SelectItem>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="maintenance">maintenance</SelectItem>
            <SelectItem value="completed">completed</SelectItem>
            <SelectItem value="cancelled">cancelled</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>${item.budget ?? "0"}</TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await adminUpdateProject({
                  projectId: item.id,
                  status,
                });
                toast.success("Project status updated.");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Update failed.");
              }
            });
          }}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
