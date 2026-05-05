import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ViewTransition } from "react";
import type { Scenario } from "@/lib/types";
import {
  CATEGORY_LABEL,
  DIFFICULTY_LABEL,
  ScenarioIcon,
} from "@/lib/glyphs";
import { Badge } from "@/components/ui/badge";
import { MetadataDot } from "@/components/metadata-dot";
import { cn } from "@/lib/utils";

const DIFFICULTY_LEVEL: Record<Scenario["difficulty"], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function ExhibitRow({
  scenario,
  isLatest = false,
}: {
  scenario: Scenario;
  isLatest?: boolean;
}) {
  const number = scenario.exhibit.replace("EXH-", "");

  return (
    <Link
      href={`/scenarios/${scenario.slug}`}
      transitionTypes={["nav-forward"]}
      aria-label={`Open exhibit ${scenario.exhibit}: ${scenario.title}`}
      className={cn(
        "group relative block border-b border-rule",
        "rounded-sm px-1 sm:px-2",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
      )}
    >
      <article
        className={cn(
          "grid items-baseline py-7 sm:py-8",
          "grid-cols-[3.25rem_1fr] gap-x-4",
          "sm:grid-cols-[5rem_1fr] sm:gap-x-7",
        )}
      >
        <div className="self-start pt-[3px] sm:pt-1">
          <ViewTransition name={`scenario-num-${scenario.slug}`} share="text-morph" default="none">
            <span
              className={cn(
                "block font-serif tabular-nums leading-none text-text-3",
                "text-[28px] sm:text-[34px]",
              )}
            >
              {number}
            </span>
          </ViewTransition>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3
              className={cn(
                "font-serif text-text-1 text-balance",
                "text-[22px] leading-[1.12] sm:text-[28px] sm:leading-[1.1]",
              )}
            >
              <ViewTransition name={`scenario-title-${scenario.slug}`} share="text-morph" default="none">
                <span className="eh-row-title">{scenario.title}</span>
              </ViewTransition>
              {isLatest && <LatestBadge />}
            </h3>
            <ArrowUpRight
              className={cn(
                "mt-1.5 size-4 shrink-0 text-text-4",
                "transition-[transform,color] duration-200 ease-out motion-reduce:transition-none",
                "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-1",
                "group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:text-text-1",
              )}
              aria-hidden
            />
          </div>

          <p className="mt-3 max-w-[64ch] text-pretty text-[13.5px] leading-[1.65] text-text-3">
            {scenario.tagline}
          </p>

          <MetaRow scenario={scenario} />
        </div>
      </article>
    </Link>
  );
}

function LatestBadge() {
  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-2.5 h-auto translate-y-[-3px] gap-1 border-0 bg-ink-soft px-1.5 py-0.5 align-middle",
        "font-mono text-[9.5px] font-normal uppercase tracking-[0.16em] text-ink",
      )}
    >
      <span className="size-1 rounded-full bg-ink" aria-hidden />
      Latest
    </Badge>
  );
}

function MetaRow({ scenario }: { scenario: Scenario }) {
  const level = DIFFICULTY_LEVEL[scenario.difficulty];
  return (
    <div
      className={cn(
        "mt-5 flex flex-wrap items-center gap-x-5 gap-y-2",
        "font-mono text-[11px] uppercase tracking-[0.12em] text-text-3",
      )}
    >
      <Field>
        <ScenarioIcon
          slug={scenario.slug}
          className="size-3 text-text-4"
        />
        <span className="sr-only">Category:</span>
        <span>{CATEGORY_LABEL[scenario.category]}</span>
      </Field>

      <Separator />

      <Field>
        <DifficultyMeter
          level={level}
          label={DIFFICULTY_LABEL[scenario.difficulty]}
        />
      </Field>

      <Separator />

      <Field>
        <span className="sr-only">Time:</span>
        <span className="tabular-nums">{scenario.estMinutes} min</span>
      </Field>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">{children}</span>
  );
}

function Separator() {
  return (
    <span className="inline-flex items-center text-text-4/50" aria-hidden>
      <MetadataDot />
    </span>
  );
}

function DifficultyMeter({ level, label }: { level: number; label: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-1.5"
      role="img"
      aria-label={`Difficulty: ${label}`}
    >
      <span className="inline-flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              i === 0 && "h-[5px]",
              i === 1 && "h-[7px]",
              i === 2 && "h-[9px]",
              i < level ? "bg-text-2" : "bg-text-4/30",
            )}
          />
        ))}
      </span>
      <span>{label}</span>
    </span>
  );
}
