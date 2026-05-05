import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Terminal } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DirectionalTransition } from "@/components/directional-transition";
import { scenarios } from "@/lib/scenarios";

export const metadata: Metadata = {
  title: "About",
  description: "What EmulateHacks is, how it works, and what it will never be.",
};

export default function AboutPage() {
  const total = scenarios.length;
  const eras = new Set(scenarios.map((s) => s.era)).size;
  const earliest = scenarios.reduce((a, b) => (a.year < b.year ? a : b)).year;

  return (
    <DirectionalTransition>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">

          {/* ── Hero ───────────────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-20">
              <p className="eh-eyebrow text-text-4">
                About · EmulateHacks · A terminal museum
              </p>

              <h1 className="mt-5 font-serif text-[64px] leading-none text-balance text-text-1 sm:text-[96px] lg:text-[112px]">
                A museum you can{" "}
                <span className="italic text-ink">type inside.</span>
              </h1>

              {/* Stats strip */}
              <dl className="mt-12 grid grid-cols-3 gap-px border border-rule sm:max-w-xl">
                <Stat n={String(total).padStart(2, "0")} label="exhibits" />
                <Stat n={String(eras)} label="eras" />
                <Stat n={earliest} label="earliest" />
              </dl>
            </div>
          </section>

          {/* ── IS / IS NOT ────────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto max-w-6xl px-6 py-0">
              <div className="grid divide-y divide-rule sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {/* IS */}
                <div className="py-14 pr-0 sm:pr-14">
                  <p className="eh-eyebrow text-ink">Is</p>
                  <ul className="mt-6 space-y-4">
                    {[
                      "An interactive archive of real hacking history",
                      "A scripted browser terminal you type through",
                      "Educational simulation with a defensive focus",
                      "A debrief after every reconstruction",
                      "Safe — no network, no real exec, ever",
                    ].map((s) => (
                      <li key={s} className="flex items-baseline gap-3">
                        <span className="mt-1 shrink-0 text-ink eh-eyebrow">→</span>
                        <span className="text-[14px] leading-relaxed text-text-2">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* IS NOT */}
                <div className="py-14 pl-0 sm:pl-14">
                  <p className="eh-eyebrow text-text-3">Is not</p>
                  <ul className="mt-6 space-y-4">
                    {[
                      "A hacking tutorial or exploit guide",
                      "A CTF platform",
                      "Running real shells or real commands",
                      "Reachable from any real network",
                      "Publishing credentials, targets, or working PoCs",
                    ].map((s) => (
                      <li key={s} className="flex items-baseline gap-3">
                        <span className="mt-1 shrink-0 text-text-4 eh-eyebrow line-through decoration-text-4">╳</span>
                        <span className="text-[14px] leading-relaxed text-text-3 line-through decoration-text-4/40">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Why ────────────────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto grid max-w-6xl gap-0 px-6 py-16 sm:grid-cols-[180px_1fr] sm:gap-16">
              <div>
                <p className="font-serif text-[64px] leading-none text-text-4/30 tabular-nums select-none">
                  01
                </p>
                <p className="mt-2 eh-eyebrow">Why it exists</p>
              </div>
              <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-text-2 sm:mt-3 [&_p]:max-w-2xl">
                <p>
                  Most security writing happens at the wrong level. Blog posts
                  explain. Conference talks narrate. CTFs challenge. Few things let
                  you sit at the prompt the way the person who lived through the
                  incident did — with the same files in the same place, and type
                  your way through it.
                </p>
                <p>
                  EmulateHacks exists to teach how incidents look from the inside,
                  so the next one is recognised earlier. Every exhibit ends with a
                  debrief: what actually happened, what was simulated, and what to
                  take back to the systems you actually own.
                </p>
              </div>
            </div>
          </section>

          {/* ── How it works ───────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto grid max-w-6xl gap-0 px-6 py-16 sm:grid-cols-[180px_1fr] sm:gap-16">
              <div>
                <p className="font-serif text-[64px] leading-none text-text-4/30 tabular-nums select-none">
                  02
                </p>
                <p className="mt-2 eh-eyebrow">Mechanics</p>
              </div>
              <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-text-2 sm:mt-3 [&_p]:max-w-2xl">
                <p>
                  Each exhibit ships with a fictional or historically abstracted
                  filesystem, a numbered list of steps, and a short narrative arc.
                  When the engine recognises a step&rsquo;s expected command, it
                  prints a quiet line of narration and unlocks the next step.
                </p>
                <p>
                  If you get stuck, type{" "}
                  <Mono>hint</Mono>. If you want to explore freely, every exhibit
                  is also browsable — the steps gate the story, not the prompt.
                  Type <Mono>help</Mono> to see everything the shell understands.
                </p>
              </div>
            </div>
          </section>

          {/* ── Terminal layer ─────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto grid max-w-6xl gap-0 px-6 py-16 sm:grid-cols-[180px_1fr] sm:gap-16">
              <div>
                <p className="font-serif text-[64px] leading-none text-text-4/30 tabular-nums select-none">
                  03
                </p>
                <p className="mt-2 eh-eyebrow">The stack</p>
              </div>
              <div className="mt-6 sm:mt-3">
                {/* Fake terminal snippet */}
                <div className="eh-crt-frame overflow-hidden rounded-sm max-w-xl">
                  <div className="eh-crt-strip flex items-center gap-2 px-4 py-2 eh-eyebrow text-text-3">
                    <Terminal className="size-3 text-ink" aria-hidden />
                    <span>stack.txt</span>
                  </div>
                  <div className="bg-background p-4 font-mono text-[12.5px] leading-[1.8]">
                    <StackLine k="terminal" v="wterm — DOM-rendered VT220, Zig core → WASM" />
                    <StackLine k="shell" v="custom engine — virtual FS, step matcher, ANSI output" />
                    <StackLine k="renderer" v="Next.js 16 · React 19 · Turbopack" />
                    <StackLine k="styling" v="Tailwind CSS v4 · Instrument Serif · Geist Mono" />
                    <StackLine k="hosting" v="Vercel · no server, no DB, no auth" />
                    <div className="mt-2 border-t border-rule pt-2 text-text-4">
                      # native text selection · browser find · copy-paste · a11y
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Safety ─────────────────────────────────────────────────── */}
          <section className="border-b border-rule">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid gap-8 rounded-sm border border-rule bg-paper-1 p-8 sm:grid-cols-[auto_1fr]">
                <ShieldAlert className="size-6 shrink-0 text-ink" aria-hidden />
                <div>
                  <p className="eh-eyebrow text-ink">Safety notice</p>
                  <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-2">
                    EmulateHacks is an educational simulation platform. All
                    environments are fictional, sandboxed, or historically
                    abstracted. The platform does not provide access to real
                    targets, real credentials, live exploitation infrastructure, or
                    malware. Historical reconstructions are abstracted so they teach
                    the shape of the incident without becoming a recipe.
                  </p>
                  <p className="mt-4 text-[13px] leading-relaxed text-text-3">
                    If you are a teacher, a security trainer, or a journalist and
                    would like a specific incident reconstructed responsibly, please{" "}
                    <Link href="/submit" className="eh-link text-text-1">
                      submit a request
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Maker ──────────────────────────────────────────────────── */}
          <section>
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eh-eyebrow">Designed and built by</p>
                  <a
                    href="https://zaidmukaddam.com"
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-2 inline-flex items-baseline gap-2"
                  >
                    <span className="font-serif text-[32px] leading-none text-text-1 transition-colors group-hover:text-ink">
                      Zaid Mukaddam
                    </span>
                    <span className="eh-eyebrow text-text-4 transition-colors group-hover:text-ink">
                      ↗
                    </span>
                  </a>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://x.com/zaidmukaddam"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm border border-rule bg-paper-1 px-3 py-2 text-[12px] text-text-3 transition-colors hover:bg-paper-2 hover:text-text-1"
                  >
                    x.com/zaidmukaddam
                  </a>
                  <a
                    href="https://github.com/zaidmukaddam"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm border border-rule bg-paper-1 px-3 py-2 text-[12px] text-text-3 transition-colors hover:bg-paper-2 hover:text-text-1"
                  >
                    github.com/zaidmukaddam
                  </a>
                </div>
              </div>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </DirectionalTransition>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="bg-paper-1 px-5 py-4">
      <dd className="font-serif text-[32px] leading-none text-ink tabular-nums">{n}</dd>
      <dt className="mt-1 eh-eyebrow text-text-4">{label}</dt>
    </div>
  );
}

function StackLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4">
      <span className="text-ink">{k}</span>
      <span className="text-text-2">{v}</span>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border border-rule bg-paper-1 px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
      {children}
    </code>
  );
}
