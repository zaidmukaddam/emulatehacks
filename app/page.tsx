import Link from "next/link";
import type { ReactNode } from "react";
import { DirectionalTransition } from "@/components/directional-transition";
import {
  Archive,
  ArrowRight,
  CircleDot,
  Library,
  ShieldCheck,
  SquareTerminal,
  Type,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ExhibitRow } from "@/components/exhibit-row";
import { InkLink } from "@/components/ink-button";
import { MetadataDot } from "@/components/metadata-dot";
import { scenarios, scenariosNewestFirst } from "@/lib/scenarios";

export default function Home() {
  const featured = scenariosNewestFirst.slice(0, 3);
  const latestSlug = scenariosNewestFirst[0].slug;
  return (
    <DirectionalTransition>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero firstSlug={latestSlug} count={scenarios.length} />
          <Catalog
            featured={featured}
            latestSlug={latestSlug}
            total={scenarios.length}
          />
          <HowItWorks />
          <Safety />
        </main>
        <SiteFooter />
      </div>
    </DirectionalTransition>
  );
}

function Hero({ firstSlug, count }: { firstSlug: string; count: number }) {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-28">
        {/* Eyebrow line */}
        <div className="flex items-center gap-3 eh-eyebrow">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <CircleDot className="size-3 eh-rec-dot" aria-hidden />
            Now exhibiting
          </span>
          <span className="text-text-4">/</span>
          <span>
            {String(count).padStart(2, "0")} reconstructions
          </span>
        </div>

        <h1 className="mt-6 max-w-3xl font-serif text-[44px] leading-[1.02] text-balance text-text-1 sm:text-[68px]">
          Replay hacker history{" "}
          <span className="italic text-ink">in your browser.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-[14px] leading-[1.65] text-text-3">
          A playable terminal museum for the hacks, incidents, and
          command-line moments that shaped computing. Every system is a
          simulation. Nothing real gets touched. You sit at the prompt the way
          the people who lived through it did, and type your way through.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <InkLink href={`/scenarios/${firstSlug}`} variant="primary" transitionTypes={["nav-forward"]}>
            Start a simulation
          </InkLink>
          <InkLink href="/scenarios" variant="secondary" showArrow={false} transitionTypes={["nav-forward"]}>
            <Archive className="size-3.5" aria-hidden />
            Explore the archive
          </InkLink>
        </div>

        {/* Exhibit-spec strip: structure instead of gradient */}
        <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-8 border-t border-rule pt-8 sm:grid-cols-4">
          <Spec icon={SquareTerminal} k="Format" v="Scripted terminals" />
          <Spec
            icon={Type}
            k="Renderer"
            v={
              <span className="inline-flex items-center gap-1.5">
                <span>wterm</span>
                <MetadataDot className="text-text-3" />
                <span>WASM</span>
              </span>
            }
          />
          <Spec icon={ShieldCheck} k="Real exec" v="None" />
          <Spec icon={Library} k="License" v="Educational" />
        </dl>
      </div>
    </section>
  );
}

function Spec({
  icon: Icon,
  k,
  v,
}: {
  icon: typeof Library;
  k: string;
  v: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 eh-eyebrow">
        <Icon className="size-3 text-text-4" aria-hidden />
        {k}
      </div>
      <dd className="mt-1.5 font-serif text-[20px] leading-tight text-text-1">
        {v}
      </dd>
    </div>
  );
}

function Catalog({
  featured,
  latestSlug,
  total,
}: {
  featured: typeof scenarios;
  latestSlug: string;
  total: number;
}) {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <header className="mb-2 flex items-end justify-between gap-6 border-b border-rule pb-8">
          <div>
            <div className="eh-eyebrow">Latest acquisitions</div>
            <h2 className="mt-2 font-serif text-[36px] leading-tight text-text-1">
              Three new exhibits.
            </h2>
            <p className="mt-2 max-w-md text-pretty text-[13px] leading-[1.65] text-text-3">
              The newest reconstructions in the archive. Open one to read the
              briefing first.
            </p>
          </div>
          <Link
            href="/scenarios"
            transitionTypes={["nav-forward"]}
            className="group inline-flex items-center gap-2 text-[13px] text-text-2 hover:text-text-1"
          >
            <span className="eh-link">Browse all {total}</span>
            <ArrowRight
              className="size-3.5 text-text-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-text-1"
              aria-hidden
            />
          </Link>
        </header>
        <div>
          {featured.map((s) => (
            <ExhibitRow
              key={s.slug}
              scenario={s}
              isLatest={s.slug === latestSlug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Pick an exhibit",
      d: "Each scenario is a self-contained reconstruction with a briefing, a fake system, and a defensive lesson.",
    },
    {
      n: "02",
      t: "Type through the story",
      d: "A real terminal renders in your browser via wterm. Commands are scripted; outputs feel real because they were written that way.",
    },
    {
      n: "03",
      t: "Read the debrief",
      d: "Every reconstruction ends with what happened, what was simulated, and what to take back to the systems you actually own.",
    },
  ];
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="eh-eyebrow">How it works</div>
        <h2 className="mt-2 font-serif text-[36px] leading-tight text-text-1">
          A museum that you can type inside.
        </h2>
        <ol className="mt-12 grid border border-rule sm:grid-cols-3 sm:divide-x sm:divide-rule">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className={`p-8 ${i < steps.length - 1 ? "border-b border-rule sm:border-b-0" : ""}`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-[28px] leading-none text-ink tabular-nums">
                  {s.n}
                </span>
                <span className="eh-eyebrow">step</span>
              </div>
              <h3 className="mt-5 font-serif text-[22px] leading-tight text-text-1">
                {s.t}
              </h3>
              <p className="mt-2 text-pretty text-[13px] leading-relaxed text-text-3">
                {s.d}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Safety() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <div className="flex items-center gap-2 eh-eyebrow">
              <ShieldCheck className="size-3 text-ink" aria-hidden />
              Safety
            </div>
            <h2 className="mt-2 font-serif text-[30px] leading-tight text-text-1 text-balance">
              No real systems are touched.
            </h2>
          </div>
          <div className="sm:col-span-8">
            <p className="text-pretty text-[14px] leading-relaxed text-text-2">
              Every environment is fictional, sandboxed, or historically
              abstracted. Commands are matched against scripted responses. The
              filesystem you see exists only inside your tab. Network commands
              return a polite refusal. There are no real credentials, no real
              hosts, no exploit code: only the shape of the story, told in the
              medium it actually happened in.
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-text-3">
              EmulateHacks exists to teach how incidents look from the inside,
              so the next one is recognised earlier. Read the{" "}
              <Link href="/about" transitionTypes={["nav-forward"]} className="eh-link text-text-1">
                full safety note
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
