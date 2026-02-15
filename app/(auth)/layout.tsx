import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-zinc-100 px-4 py-10 text-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-8 top-10 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-400/10" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-400/10" />
      </div>
      <div className="mx-auto mb-4 flex w-full max-w-md justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-lg shadow-zinc-200/40 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85 dark:shadow-black/40 sm:p-8">
        {children}
      </div>
    </div>
  );
}
