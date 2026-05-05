"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// useMountEffect: escape hatch for one-time external sync on mount.
function useMountEffect(fn: () => void) {
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(fn, []);
}

const ACCENTS = [
  { id: "green", label: "Green",  bg: "bg-[oklch(0.72_0.18_145)]" },
  { id: "amber", label: "Amber",  bg: "bg-[oklch(0.78_0.11_78)]"  },
  { id: "mono",  label: "Mono",   bg: "bg-[oklch(0.84_0.005_80)]" },
] as const;

type AccentId = (typeof ACCENTS)[number]["id"];

export function AccentSwitcher() {
  const { theme, setTheme } = useTheme();
  // Defer active state to after hydration — server always renders all inactive
  // to avoid a theme mismatch between SSR (theme=undefined) and client.
  const [mounted, setMounted] = useState(false);
  useMountEffect(() => { setMounted(true); });

  const activeTheme = mounted ? theme : undefined;

  return (
    <div
      role="radiogroup"
      aria-label="Accent colour theme"
      className="flex items-center gap-1 rounded-sm border border-rule bg-paper-1 p-1"
    >
      {ACCENTS.map((a) => {
        const active = activeTheme === a.id;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={a.label}
            onClick={() => setTheme(a.id as AccentId)}
            className={cn(
              "flex size-5 items-center justify-center rounded-[2px]",
              "transition-colors duration-150 ease-out active:translate-y-px",
              active ? "bg-paper-3" : "hover:bg-paper-2",
            )}
          >
            <span
              className={cn(
                "block size-2.5 rounded-full transition-opacity duration-150",
                a.bg,
                active ? "opacity-100" : "opacity-35",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
