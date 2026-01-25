"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/uploadthing";

interface WorkspaceFileUploaderProps {
  projectId: string;
  label?: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function WorkspaceFileUploader({ projectId, label, title, subtitle, disabled }: WorkspaceFileUploaderProps) {
  const router = useRouter();

  if (disabled) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
        Uploads are disabled because this project is completed.
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint="projectWorkspaceFiles"
      input={{ projectId, label }}
      content={{
        label: title ?? "Drop files or click to upload",
        allowedContent: subtitle ?? "PDF, DOCX, images, audio, or archives",
      }}
      appearance={{
        container:
          "w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40",
        label: "text-sm font-semibold text-zinc-600 dark:text-zinc-300",
        allowedContent: "text-xs text-zinc-400",
        uploadIcon: "text-zinc-400",
        button:
          "mt-3 inline-flex items-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
      }}
      onClientUploadComplete={() => {
        router.refresh();
        toast.success("Files uploaded successfully.");
      }}
      onUploadError={(error) => {
        console.error("Upload failed:", error.message);
        toast.error("Upload failed.");
      }}
    />
  );
}
