"use client";

import { useMemo, useState } from "react";
import { ViewTransition } from "react";
import { Filter } from "lucide-react";
import { ExhibitRow } from "@/components/exhibit-row";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { CategoryIcon } from "@/lib/glyphs";
import { groupByYear } from "@/lib/scenarios";
import type { Category, Scenario } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterValue = "all" | Category;

const FILTER_ORDER: FilterValue[] = [
  "all",
  "incident-response",
  "modern-cloud",
  "classic-history",
  "ctf-puzzle",
];

const FILTER_SHORT_LABEL: Record<Category, string> = {
  "incident-response": "Defensive",
  "modern-cloud": "Cloud",
  "classic-history": "Classic",
  "ctf-puzzle": "Puzzle",
};

export function ScenarioArchive({
  scenarios,
  latestSlug,
}: {
  scenarios: Scenario[];
  latestSlug: string;
}) {
  const [selected, setSelected] = useState<FilterValue>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scenarios.length };
    for (const s of scenarios) {
      c[s.category] = (c[s.category] ?? 0) + 1;
    }
    return c;
  }, [scenarios]);

  const filtered = useMemo(() => {
    if (selected === "all") return scenarios;
    return scenarios.filter((s) => s.category === selected);
  }, [scenarios, selected]);

  const groups = useMemo(() => groupByYear(filtered), [filtered]);

  const visibleFilters = useMemo(
    () =>
      FILTER_ORDER.filter(
        (value) => value === "all" || (counts[value] ?? 0) > 0,
      ),
    [counts],
  );

  return (
    <>
      <FilterBar
        filters={visibleFilters}
        counts={counts}
        selected={selected}
        onSelect={setSelected}
        showing={filtered.length}
        total={scenarios.length}
      />

      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {groups.map(({ year, items }, groupIdx) => (
            <section
              key={year}
              aria-labelledby={`year-${year}`}
              className="relative"
            >
              <YearHeader
                year={year}
                count={items.length}
                isFirst={groupIdx === 0}
              />
              <ul>
                {items.map((s) => (
                  <ViewTransition key={s.slug}>
                    <li>
                      <ExhibitRow
                        scenario={s}
                        isLatest={s.slug === latestSlug}
                      />
                    </li>
                  </ViewTransition>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function FilterBar({
  filters,
  counts,
  selected,
  onSelect,
  showing,
  total,
}: {
  filters: FilterValue[];
  counts: Record<string, number>;
  selected: FilterValue;
  onSelect: (v: FilterValue) => void;
  showing: number;
  total: number;
}) {
  return (
    <div
      style={{ viewTransitionName: "archive-filter-bar" }}
      className={cn(
        "sticky top-14 z-20 -mx-6 mb-2 flex flex-wrap items-baseline gap-x-7 gap-y-3",
        "border-b border-rule bg-background/92 px-6 py-4 backdrop-blur-sm",
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-text-4">
        <Filter className="size-3" aria-hidden />
        <span className="eh-eyebrow">Filter</span>
      </span>

      <ToggleGroup
        value={[selected]}
        onValueChange={(value) => {
          const next = value[0];
          if (next) onSelect(next as FilterValue);
        }}
        spacing={5}
        aria-label="Filter exhibits by category"
        className="flex flex-wrap items-baseline rounded-none"
      >
        {filters.map((value) => (
          <FilterToggle
            key={value}
            value={value}
            active={selected === value}
            count={counts[value] ?? 0}
          />
        ))}
      </ToggleGroup>

      <span className="ml-auto eh-eyebrow tabular-nums text-text-4">
        <span className="text-text-2">{showing}</span> / {total}
      </span>
    </div>
  );
}

function FilterToggle({
  value,
  active,
  count,
}: {
  value: FilterValue;
  active: boolean;
  count: number;
}) {
  const isAll = value === "all";
  const label = isAll ? "All" : FILTER_SHORT_LABEL[value];
  return (
    <ToggleGroupItem
      value={value}
      aria-label={`${label} (${count})`}
      className={cn(
        "group/toggle relative inline-flex h-auto min-w-0 items-baseline gap-1.5 rounded-none px-0 py-1",
        "bg-transparent hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent",
        "font-mono text-[11.5px] font-normal uppercase tracking-[0.14em] whitespace-nowrap",
        "transition-colors duration-150 ease-out motion-reduce:transition-none",
        active ? "text-ink" : "text-text-3 hover:text-text-1",
        "focus-visible:ring-0 focus-visible:ring-offset-0",
      )}
    >
      {!isAll && (
        <CategoryIcon
          category={value}
          className={cn(
            "size-3 self-center transition-colors duration-150 motion-reduce:transition-none",
            active
              ? "text-ink"
              : "text-text-4 group-hover/toggle:text-text-2",
          )}
        />
      )}
      <span className="relative">
        {label}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-[-3px] h-px origin-left",
            "transition-transform duration-200 ease-out motion-reduce:transition-none",
            active
              ? "scale-x-100 bg-ink"
              : "scale-x-0 bg-text-2 group-hover/toggle:scale-x-100",
          )}
        />
      </span>
      <span
        className={cn(
          "ml-0.5 text-[10px] tabular-nums",
          active ? "text-ink/70" : "text-text-4",
        )}
      >
        {String(count).padStart(2, "0")}
      </span>
    </ToggleGroupItem>
  );
}

function YearHeader({
  year,
  count,
  isFirst,
}: {
  year: string;
  count: number;
  isFirst: boolean;
}) {
  return (
    <header
      id={`year-${year}`}
      className={cn(
        "grid items-baseline gap-x-4 border-b border-rule pb-3",
        "grid-cols-[3.25rem_1fr] sm:grid-cols-[5rem_1fr] sm:gap-x-7",
        isFirst ? "mt-8" : "mt-16",
      )}
    >
      <span className="font-serif text-[28px] leading-none tabular-nums text-text-1 sm:text-[34px]">
        {year}
      </span>
      <span className="eh-eyebrow self-center text-text-3">
        {String(count).padStart(2, "0")} {count === 1 ? "entry" : "entries"}
      </span>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-start gap-3 border-y border-rule py-16">
      <span className="eh-eyebrow">Nothing here</span>
      <p className="font-serif text-[24px] leading-tight text-text-1">
        No entries in this category yet.
      </p>
      <p className="text-[13px] text-text-3">
        Pick a different filter, or open the full archive.
      </p>
    </div>
  );
}
