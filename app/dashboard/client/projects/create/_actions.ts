"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function generateAiQuestions(idea: string) {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock dynamic questions based on idea keywords
  const questions = [
    {
      id: "q1",
      question: "Who is the primary target audience for this project?",
      placeholder: "e.g., Small business owners, teenagers, developers...",
    },
    {
      id: "q2",
      question: "What are the 3 most critical features you must have at launch?",
      placeholder: "e.g., User login, payment gateway, real-time chat...",
    },
    {
      id: "q3",
      question: "Do you have any specific branding or design preferences?",
      placeholder: "e.g., Minimalist, dark mode, high-energy colors...",
    },
  ];

  return questions;
}

export async function generateProjectPlan(data: { idea: string; answers: any; mode: string }) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock AI Plan generation
  const plan = {
    summary: `A professional ${data.idea} solution tailored for your target audience.`,
    deliverables: [
      "Discovery & Requirement Document",
      "High-fidelity UI/UX Designs",
      "Core Backend Infrastructure",
      "Frontend Implementation",
      "Testing & Quality Assurance",
    ],
    timeline: "4-6 weeks",
    technicalSpecs: [
      "Next.js 15+ (App Router)",
      "Tailwind CSS v4",
      "PostgreSQL with Drizzle ORM",
      "Better Auth for Security",
    ],
  };

  return plan;
}

export async function createFinalProject(data: {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  plan: any;
  status: "draft" | "active";
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const projectId = nanoid();

  await db.insert(project).values({
    id: projectId,
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: data.deadline ? new Date(data.deadline) : null,
    status: data.status,
    clientId: session.user.id,
    plan: JSON.stringify(data.plan),
  });

  revalidatePath("/dashboard/client");
  return { id: projectId };
}
