import type { Metadata } from "next";
import { Library } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ScenarioArchive } from "@/components/scenario-archive";
import { scenariosNewestFirst } from "@/lib/scenarios";
import { DirectionalTransition } from "@/components/directional-transition";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every exhibit in the EmulateHacks terminal museum.",
};

export default function ScenariosPage() {
  const total = scenariosNewestFirst.length;
  const latestSlug = scenariosNewestFirst[0]?.slug ?? "";
  const yearsCovered = new Set(scenariosNewestFirst.map((s) => s.year)).size;
  const earliest = scenariosNewestFirst[scenariosNewestFirst.length - 1].year;
  const latestYear = scenariosNewestFirst[0].year;

  return (
    <DirectionalTransition>
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-rule">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-12">
            <div className="flex items-center gap-2 eh-eyebrow">
              <Library className="size-3 text-ink" aria-hidden />
              The archive
            </div>
            <h1 className="mt-3 font-serif text-[44px] leading-[1.05] text-balance text-text-1 sm:text-[58px]">
              Every exhibit, newest first.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-[14px] leading-[1.65] text-text-3">
              Each entry opens to a briefing (the system, your role, the
              objective) before you step into the terminal.
            </p>
            <ArchiveStats
              total={total}
              years={yearsCovered}
              span={`${earliest}-${latestYear}`}
            />
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <ScenarioArchive
            scenarios={scenariosNewestFirst}
            latestSlug={latestSlug}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
    </DirectionalTransition>
  );
}

function ArchiveStats({
  total,
  years,
  span,
}: {
  total: number;
  years: number;
  span: string;
}) {
  const items = [
    { k: "Exhibits", v: String(total).padStart(2, "0") },
    { k: "Years covered", v: String(years).padStart(2, "0") },
    { k: "Span", v: span },
  ];
  return (
    <dl className="mt-10 grid max-w-md grid-cols-3 gap-x-8 border-t border-rule pt-6">
      {items.map((item) => (
        <div key={item.k}>
          <dt className="eh-eyebrow">{item.k}</dt>
          <dd className="mt-1.5 font-serif text-[18px] leading-tight tabular-nums text-text-1">
            {item.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
