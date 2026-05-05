"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { WTerm } from "@wterm/dom";
import { Terminal, useTerminal } from "@wterm/react";
import "@wterm/react/css";
import {
  ArrowLeft,
  CircleDot,
  Command as CommandIcon,
  Lightbulb,
  ListChecks,
  Keyboard,
} from "lucide-react";
import { ScenarioShell } from "@/lib/engine/runtime";
import type { Scenario } from "@/lib/types";
import { MetadataDot } from "@/components/metadata-dot";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "Default", theme: undefined },
  { value: "Monokai", theme: "monokai" },
  { value: "Solarized", theme: "solarized-dark" },
] as const;

type ThemeLabel = (typeof THEMES)[number]["value"];

function scrollWTermToBottom(wt: WTerm | null) {
  const el = wt?.element;
  if (!el) return;
  const max = el.scrollHeight - el.clientHeight;
  el.scrollTop = max > 0 ? max : 0;
}

export function PlaySession({ scenario }: { scenario: Scenario }) {
  const { ref, write, focus } = useTerminal();
  const wtermRef = useRef<WTerm | null>(null);
  const shellRef = useRef<ScenarioShell | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [themeLabel, setThemeLabel] = useState<ThemeLabel>("Default");
  const [hintOpen, setHintOpen] = useState(false);
  const theme = THEMES.find((t) => t.value === themeLabel)?.theme;

  // Construct the shell once, but ALWAYS (re)attach on every onReady. wterm
  // creates a fresh terminal instance on each mount (and React Strict Mode in
  // dev causes a mount-unmount-remount cycle), so the previous canvas is
  // gone but the shell's step/buffer state is worth preserving across that
  // remount. Re-attaching reprints the boot + current prompt onto the fresh
  // instance, without it, the second wterm comes up blank on soft navigation.
  //
  // Guard against stale callbacks: in Strict Mode the first WTerm's async
  // init() can resolve *after* a second WTerm is already active.  When that
  // happens, ref.current.instance will be the newer WTerm, not `wt`, so we
  // skip the attach to avoid printing boot content twice into the same canvas.
  const handleReady = useCallback(
    (wt: WTerm) => {
      if (ref.current && ref.current.instance !== wt) return;
      wtermRef.current = wt;
      let shell = shellRef.current;
      if (!shell) {
        shell = new ScenarioShell(scenario, {
          onStepComplete: (i) => {
            setStepIndex(i + 1);
            setHintOpen(false);
          },
          onScenarioComplete: () => setCompleted(true),
        });
        shellRef.current = shell;
      }
      shell.attach((data) => {
        write(data);
        // wterm only auto-scrolls when the viewport was already at the bottom.
        // After clear (2J/3J), jump to the live region if the user had scrolled up.
        if (data.includes("\x1b[2J")) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => scrollWTermToBottom(wtermRef.current));
          });
        }
      });
      focus();
    },
    [scenario, ref, write, focus],
  );

  const handleData = useCallback((data: string) => {
    shellRef.current?.handleInput(data);
  }, []);

  const total = scenario.steps.length;
  const currentStep = scenario.steps[Math.min(stepIndex, total - 1)];

  return (
    <div className="flex min-h-dvh flex-col">
      <PlayHeader
        scenario={scenario}
        themeLabel={themeLabel}
        onTheme={setThemeLabel}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Terminal frame */}
          <div className="eh-crt-frame eh-enter relative overflow-hidden rounded-sm">
            <span className="eh-screw absolute left-2 top-2" aria-hidden />
            <span className="eh-screw absolute right-2 top-2" aria-hidden />
            <SpecStrip scenario={scenario} stepIndex={stepIndex} total={total} />
            <div className="bg-background p-3 sm:p-4">
              <Terminal
                ref={ref}
                cols={92}
                rows={28}
                wasmUrl="/wterm.wasm"
                theme={theme}
                onData={handleData}
                onReady={handleReady}
                className="eh-terminal w-full"
              />
            </div>
          </div>

          {/* Side panel */}
          <aside
            className="flex flex-col gap-4 eh-enter"
            style={{ animationDelay: "60ms" }}
          >
            <Panel>
              <PanelLabel icon={ListChecks}>Progress</PanelLabel>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-serif text-[34px] leading-none text-text-1 tabular-nums">
                  {String(Math.min(stepIndex, total)).padStart(2, "0")}
                </span>
                <span className="text-[13px] text-text-3 tabular-nums">
                  / {String(total).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: total }).map((_, i) => {
                  const done = i < stepIndex;
                  const current = i === stepIndex && !completed;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-[1px] transition-colors duration-200 ease-out",
                        done && "bg-ink",
                        current && "bg-ink/50",
                        !done && !current && "bg-paper-3",
                      )}
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel>
              {completed ? (
                <>
                  <PanelLabel>Reconstruction complete</PanelLabel>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                    You walked the full path. Read the debrief below for what
                    this looked like in the real incident.
                  </p>
                </>
              ) : currentStep ? (
                <>
                  <PanelLabel>Current step</PanelLabel>
                  <p className="mt-2 text-[14px] leading-relaxed text-text-1">
                    {currentStep.goal}
                  </p>
                  <HintDisclosure
                    open={hintOpen}
                    onToggle={() => setHintOpen((o) => !o)}
                    text={currentStep.hint}
                  />
                </>
              ) : null}
            </Panel>

            <Panel>
              <PanelLabel icon={Keyboard}>Quick reference</PanelLabel>
              <ul className="mt-3 space-y-2 text-[12px] text-text-3">
                <RefRow keys={["help"]} desc="list commands" />
                <RefRow keys={["hint"]} desc="reveal current hint" />
                <RefRow keys={["goal"]} desc="re-show step" />
                <RefRow keys={["clear"]} desc="clear screen" />
                <RefRow keys={["Up", "Down"]} desc="history" />
                <RefRow keys={["Ctrl", "C"]} desc="cancel line" />
              </ul>
            </Panel>
          </aside>
        </div>

        {completed && <Debrief scenario={scenario} />}
      </main>
    </div>
  );
}

function PlayHeader({
  scenario,
  themeLabel,
  onTheme,
}: {
  scenario: Scenario;
  themeLabel: ThemeLabel;
  onTheme: (v: ThemeLabel) => void;
}) {
  return (
    <header className="border-b border-rule bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href={`/scenarios/${scenario.slug}`}
          className="group inline-flex items-center gap-1.5 text-[12px] text-text-3 transition-colors hover:text-text-1"
        >
          <ArrowLeft
            className="size-3 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
            aria-hidden
          />
          Briefing
        </Link>
        <div className="hidden items-center gap-1.5 eh-eyebrow text-ink sm:flex">
          <CircleDot className="size-3 eh-rec-dot" aria-hidden />
          Live reconstruction
        </div>
        <ThemeSwitch value={themeLabel} onChange={onTheme} />
      </div>
    </header>
  );
}

function ThemeSwitch({
  value,
  onChange,
}: {
  value: ThemeLabel;
  onChange: (v: ThemeLabel) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Terminal theme"
      className="flex items-center gap-0.5 rounded-sm border border-rule bg-paper-1 p-0.5"
    >
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-[2px] px-2 py-1 text-[11px] transition-colors duration-150 ease-out active:translate-y-px",
            value === t.value
              ? "bg-paper-3 text-text-1"
              : "text-text-3 hover:text-text-1",
          )}
        >
          {t.value}
        </button>
      ))}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-rule bg-paper-1 p-4">
      {children}
    </section>
  );
}

function PanelLabel({
  icon: Icon,
  children,
}: {
  icon?: typeof ListChecks;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 eh-eyebrow">
      {Icon && <Icon className="size-3 text-text-4" aria-hidden />}
      {children}
    </div>
  );
}

function HintDisclosure({
  open,
  onToggle,
  text,
}: {
  open: boolean;
  onToggle: () => void;
  text: string;
}) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "group inline-flex items-center gap-1.5 text-[12px] text-text-3 transition-colors duration-150 ease-out",
          "hover:text-text-1",
        )}
      >
        <Lightbulb className="size-3 text-text-4 transition-colors group-hover:text-ink" aria-hidden />
        {open ? "Hide hint" : "Reveal hint"}
      </button>
      <div className="eh-disclosure mt-2" data-open={open ? "true" : "false"}>
        <div>
          <p className="rounded-sm border border-rule bg-paper-2 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function SpecStrip({
  scenario,
  stepIndex,
  total,
}: {
  scenario: Scenario;
  stepIndex: number;
  total: number;
}) {
  return (
    <div className="eh-crt-strip flex items-center justify-between px-4 py-2.5 eh-eyebrow text-text-3">
      <div className="flex items-center gap-3">
        <span className="text-ink">{scenario.exhibit}</span>
        <span aria-hidden className="inline-flex items-center text-text-4">
          <MetadataDot />
        </span>
        <span className="hidden text-text-2 sm:inline">{scenario.title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-text-2 tabular-nums">
          {String(Math.min(stepIndex, total)).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="hidden font-mono text-text-4 normal-case tracking-normal sm:inline">
          {scenario.user}@{scenario.host}
        </span>
      </div>
    </div>
  );
}

function RefRow({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm border border-rule-strong bg-paper-2 px-1 font-mono text-[10.5px] text-text-1"
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-[12px]">{desc}</span>
    </li>
  );
}

function Debrief({ scenario }: { scenario: Scenario }) {
  return (
    <section className="mt-10 eh-enter rounded-sm border border-rule bg-paper-1 p-8">
      <div className="flex items-center gap-2 eh-eyebrow text-ink">
        <CommandIcon className="size-3" aria-hidden />
        Debrief
      </div>
      <h2 className="mt-3 font-serif text-[34px] leading-tight text-text-1">
        What actually happened
      </h2>
      <p className="mt-4 max-w-2xl text-pretty text-[14.5px] leading-relaxed text-text-2">
        {scenario.debrief.summary}
      </p>

      <h3 className="mt-8 eh-eyebrow">Defensive lesson</h3>
      <p className="mt-2 max-w-2xl text-pretty text-[14px] leading-relaxed text-text-2">
        {scenario.debrief.lesson}
      </p>

      <h3 className="mt-8 eh-eyebrow">What was simulated</h3>
      <ul className="mt-2 space-y-1.5 text-[13px] text-text-3">
        {scenario.debrief.simulated.map((s) => (
          <li key={s} className="flex gap-2">
            <span aria-hidden className="mt-1.5 inline-flex shrink-0 text-ink">
              <MetadataDot />
            </span>
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/scenarios"
          className="group inline-flex items-center gap-2 rounded-sm border border-rule-strong bg-paper-2 px-4 py-2 text-[13px] text-text-1 transition-colors duration-150 ease-out hover:bg-paper-3 active:translate-y-px"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
            aria-hidden
          />
          Back to the archive
        </Link>
      </div>
    </section>
  );
}
