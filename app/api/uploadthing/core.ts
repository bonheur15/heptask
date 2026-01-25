import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { project, projectFile } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const uploadthing = createUploadthing();

const inputSchema = z.object({
  projectId: z.string().min(1),
  label: z.string().optional(),
});

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export const fileRouter = {
  projectWorkspaceFiles: uploadthing({
    image: { maxFileCount: 6, maxFileSize: "8MB" },
    pdf: { maxFileCount: 6, maxFileSize: "16MB" },
    text: { maxFileCount: 6, maxFileSize: "8MB" },
    audio: { maxFileCount: 4, maxFileSize: "32MB" },
    video: { maxFileCount: 2, maxFileSize: "64MB" },
    blob: { maxFileCount: 6, maxFileSize: "16MB" },
  })
    .input(inputSchema)
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      const currentProject = await db.query.project.findFirst({
        where: eq(project.id, input.projectId),
      });

      if (!currentProject) {
        throw new Error("Project not found");
      }

      const isClient = currentProject.clientId === session.user.id;
      const isTalent = currentProject.talentId === session.user.id;

      if (!isClient && !isTalent) {
        throw new Error("Forbidden");
      }

      return {
        userId: session.user.id,
        projectId: input.projectId,
        label: input.label ?? null,
        role: isClient ? "client" : "talent",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const recordId = nanoid();
      await db.insert(projectFile).values({
        id: recordId,
        projectId: metadata.projectId,
        name: file.name,
        url: file.url,
        size: formatBytes(file.size),
        type: file.type,
        uploadedBy: metadata.userId,
      });
      return { fileId: recordId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;
