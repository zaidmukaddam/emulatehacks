"use client";

import { Geist_Mono, Instrument_Serif } from "next/font/google";
import { CircleDot } from "lucide-react";
import { InkButton, InkLink } from "@/components/ink-button";
import { StatusPageShell } from "@/components/status-page-shell";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <StatusPageShell>
          <main className="flex-1">
            <section className="border-b border-rule">
              <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-20 sm:pb-28">
                <p className="flex flex-wrap items-center gap-2 eh-eyebrow text-text-3">
                  <span className="inline-flex items-center gap-1.5 text-destructive">
                    <CircleDot className="size-2.5" aria-hidden />
                    Critical error
                  </span>
                  <span className="text-text-4">/</span>
                  <span>Museum offline</span>
                </p>

                <h1 className="mt-6 max-w-[22ch] font-serif text-[48px] leading-[1.05] text-balance text-text-1 sm:text-[64px] lg:text-[72px]">
                  The entire exhibit shell{" "}
                  <span className="italic text-ink">needs a reset.</span>
                </h1>

                <p className="mt-6 max-w-lg text-pretty text-[14px] leading-[1.7] text-text-3">
                  A fault occurred around the root layout, so the usual
                  navigation and theme chrome could not load. Reloading may
                  restore the experience.
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
                  <InkLink href="/" variant="secondary" showArrow={false}>
                    Return home
                  </InkLink>
                </div>
              </div>
            </section>
          </main>
        </StatusPageShell>
      </body>
    </html>
  );
}
