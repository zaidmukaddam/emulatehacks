"use client";

import Link from "next/link";
import { Archive, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimal site chrome for client-only boundaries (`error.tsx`, `global-error.tsx`)
 * where server components like `SiteHeader` cannot be imported.
 */
export function StatusPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
      <header className="sticky top-0 z-30 border-b border-rule bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="font-serif text-[24px] leading-none text-text-1">
              EmulateHacks
            </span>
            <span className="hidden eh-eyebrow text-text-4 sm:inline">
              terminal museum
            </span>
          </Link>
          <nav>
            <Link
              href="/scenarios"
              className={cn(
                "group/archive inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] text-text-2",
                "transition-colors duration-150 ease-out hover:bg-paper-1 hover:text-text-1",
                "active:translate-y-px",
              )}
            >
              <Archive
                className="size-3.5 text-text-4 transition-colors group-hover/archive:text-text-2"
                aria-hidden
              />
              Archive
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 eh-eyebrow text-text-4">
          <span>© 2026 Zaid Mukaddam</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-ink" aria-hidden />
            No real systems reachable from this site
          </span>
        </div>
      </footer>
    </div>
  );
}
