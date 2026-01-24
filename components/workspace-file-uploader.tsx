"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/uploadthing";

interface WorkspaceFileUploaderProps {
  projectId: string;
  label?: string;
  title?: string;
  subtitle?: string;
}

export function WorkspaceFileUploader({ projectId, label, title, subtitle }: WorkspaceFileUploaderProps) {
  const router = useRouter();

  return (
    <UploadDropzone
      endpoint="projectWorkspaceFiles"
      input={{ projectId, label }}
      content={{
        label: title ?? "Drop files or click to upload",
        allowedContent: subtitle ?? "PDF, DOCX, images, audio, or archives",
      }}
      onClientUploadComplete={() => {
        router.refresh();
      }}
      onUploadError={(error) => {
        console.error("Upload failed:", error.message);
      }}
      className="ut-button:bg-zinc-900 ut-button:text-zinc-50 ut-button:hover:bg-zinc-800 ut-label:text-zinc-500 ut-allowed-content:text-zinc-400 ut-upload-icon:text-zinc-400 ut-box:border-dashed ut-box:border-zinc-200 ut-box:bg-zinc-50/50 dark:ut-box:bg-zinc-900/40 dark:ut-box:border-zinc-800"
    />
  );
}
