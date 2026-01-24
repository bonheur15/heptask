"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "@/components/uploadthing";

interface WorkspaceFileUploaderProps {
  projectId: string;
  label?: string;
}

export function WorkspaceFileUploader({ projectId, label }: WorkspaceFileUploaderProps) {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="projectWorkspaceFiles"
      input={{ projectId, label }}
      onClientUploadComplete={() => {
        router.refresh();
      }}
      onUploadError={(error) => {
        console.error("Upload failed:", error.message);
      }}
    />
  );
}
