"use client";

import { CircleDot } from "lucide-react";
import { DirectionalTransition } from "@/components/directional-transition";
import { InkButton, InkLink } from "@/components/ink-button";
import { StatusPageShell } from "@/components/status-page-shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DirectionalTransition>
      <StatusPageShell>
        <main className="flex-1">
          <section className="border-b border-rule">
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-20 sm:pb-28">
              <p className="flex flex-wrap items-center gap-2 eh-eyebrow text-text-3">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <CircleDot className="size-2.5 eh-rec-dot" aria-hidden />
                  Error
                </span>
                <span className="text-text-4">/</span>
                <span>Simulation interrupted</span>
              </p>

              <h1 className="mt-6 max-w-[20ch] font-serif text-[48px] leading-[1.05] text-balance text-text-1 sm:text-[64px] lg:text-[72px]">
                The reconstruction hit{" "}
                <span className="italic text-ink">a snag.</span>
              </h1>

              <p className="mt-6 max-w-lg text-pretty text-[14px] leading-[1.7] text-text-3">
                Something went wrong while rendering this page. You can try
                again, or return to the museum lobby. Your session is still a
                safe simulation; nothing reaches real systems from this site.
              </p>

              {error.digest ? (
                <p className="mt-6 font-mono text-[11px] leading-relaxed text-text-4">
                  Reference: {error.digest}
                </p>
              ) : null}

              {process.env.NODE_ENV === "development" ? (
                <pre className="mt-6 max-h-40 overflow-auto rounded-sm border border-rule bg-paper-1 p-4 font-mono text-[11px] leading-relaxed text-text-3 whitespace-pre-wrap">
                  {error.message}
                </pre>
              ) : null}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <InkButton variant="primary" onClick={() => reset()}>
                  Try again
                </InkButton>
                <InkLink href="/" variant="secondary" transitionTypes={["nav-back"]}>
                  Return home
                </InkLink>
              </div>
            </div>
          </section>
        </main>
      </StatusPageShell>
    </DirectionalTransition>
  );
}
