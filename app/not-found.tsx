import type { Metadata } from "next";
import { CircleDot } from "lucide-react";
import { DirectionalTransition } from "@/components/directional-transition";
import { InkLink } from "@/components/ink-button";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Not found",
  description: "That page or exhibit is not in the archive.",
};

export default function NotFound() {
  return (
    <DirectionalTransition>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <section className="border-b border-rule">
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-20 sm:pb-28">
              <p className="flex flex-wrap items-center gap-2 eh-eyebrow text-text-3">
                <span className="inline-flex items-center gap-1.5 text-ink tabular-nums">
                  <CircleDot className="size-2.5" aria-hidden />
                  404
                </span>
                <span className="text-text-4">/</span>
                <span>Exhibit not found</span>
              </p>

              <h1 className="mt-6 max-w-[18ch] font-serif text-[48px] leading-[1.05] text-balance text-text-1 sm:text-[64px] lg:text-[72px]">
                This terminal session{" "}
                <span className="italic text-ink">never shipped.</span>
              </h1>

              <p className="mt-6 max-w-lg text-pretty text-[14px] leading-[1.7] text-text-3">
                The URL is not part of the museum catalog. It may have moved, or
                the address was mistyped. Head back to the lobby or browse the
                archive of reconstructions.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <InkLink href="/" variant="primary" transitionTypes={["nav-back"]}>
                  Return home
                </InkLink>
                <InkLink
                  href="/scenarios"
                  variant="secondary"
                  transitionTypes={["nav-forward"]}
                >
                  Open archive
                </InkLink>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </DirectionalTransition>
  );
}
