import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DirectionalTransition } from "@/components/directional-transition";
import { InkLink } from "@/components/ink-button";
import { MetadataDot } from "@/components/metadata-dot";
import {
  CategoryIcon,
  CATEGORY_LABEL,
  DIFFICULTY_LABEL,
  ScenarioIcon,
} from "@/lib/glyphs";
import { getScenario, scenarios } from "@/lib/scenarios";

export function generateStaticParams() {
  return scenarios.map((s) => ({ slug: s.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getScenario(slug);
  if (!s) return { title: "Not found" };
  return { title: s.title, description: s.tagline };
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  return (
    <DirectionalTransition>
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-6xl px-6 pt-10 pb-20">
          <Link
            href="/scenarios"
            transitionTypes={["nav-back"]}
            className="group inline-flex items-center gap-1.5 text-[12px] text-text-3 transition-colors hover:text-text-1"
          >
            <ArrowLeft
              className="size-3 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
              aria-hidden
            />
            Archive
          </Link>

          <header className="mt-8 grid grid-cols-12 gap-x-6 gap-y-6 border-b border-rule pb-10">
            {/* Left rail with catalog number + glyph */}
            <div className="col-span-12 sm:col-span-2">
              <ViewTransition name={`scenario-num-${scenario.slug}`} share="text-morph" default="none">
                <div className="font-serif text-[64px] leading-none text-text-2 tabular-nums">
                  {scenario.exhibit.replace("EXH-", "")}
                </div>
              </ViewTransition>
              <div className="mt-4 grid size-9 place-items-center rounded-sm border border-rule bg-paper-1 text-ink">
                <ScenarioIcon slug={scenario.slug} className="size-4" />
              </div>
            </div>

            <div className="col-span-12 sm:col-span-10">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 eh-eyebrow">
                <span className="text-ink">{scenario.exhibit}</span>
                <MetadataDot className="text-text-4" />
                <span>{scenario.year}</span>
                <MetadataDot className="text-text-4" />
                <span>
                  {scenario.fictional ? "Fictional reconstruction" : "Historical"}
                </span>
              </div>
              <ViewTransition name={`scenario-title-${scenario.slug}`} share="text-morph" default="none">
                <h1 className="mt-3 font-serif text-[48px] leading-[1.04] text-balance text-text-1 sm:text-[60px]">
                  {scenario.title}
                </h1>
              </ViewTransition>
              <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-text-3">
                {scenario.tagline}
              </p>
            </div>
          </header>

          {/* Spec strip */}
          <dl className="mt-10 grid grid-cols-2 border border-rule sm:grid-cols-4 sm:divide-x sm:divide-rule [&>div:nth-child(-n+2)]:border-b sm:[&>div:nth-child(-n+2)]:border-b-0 [&>div]:border-rule">
            <Spec
              k="Type"
              v={CATEGORY_LABEL[scenario.category]}
              leading={
                <CategoryIcon
                  category={scenario.category}
                  className="size-3 text-text-4"
                />
              }
            />
            <Spec k="Difficulty" v={DIFFICULTY_LABEL[scenario.difficulty]} />
            <Spec k="Era" v={scenario.era} />
            <Spec
              k="Time"
              leading={<Clock className="size-3 text-text-4" aria-hidden />}
              v={`${scenario.estMinutes} min`}
            />
          </dl>

          <Section title="Briefing">
            <p className="text-pretty text-[14.5px] leading-relaxed text-text-2">
              {scenario.briefing}
            </p>
          </Section>

          <Section title="Your role">
            <p className="text-pretty text-[14.5px] leading-relaxed text-text-2">
              {scenario.role}
            </p>
          </Section>

          <Section title="Objective">
            <p className="text-pretty text-[14.5px] leading-relaxed text-text-2">
              {scenario.objective}
            </p>
          </Section>

          <Section title="Terminal environment">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <KV k="user" v={scenario.user} />
              <KV k="host" v={scenario.host} />
              <KV k="cwd" v={scenario.cwd} />
              <KV k="steps" v={String(scenario.steps.length)} />
            </dl>
          </Section>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <InkLink href={`/play/${scenario.slug}`} transitionTypes={["nav-forward"]}>
              Enter the terminal
            </InkLink>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-text-3">
              <Clock className="size-3 shrink-0 text-text-4" aria-hidden />
              <span>About {scenario.estMinutes} minutes</span>
              <MetadataDot className="text-text-4" />
              <span>Safe simulation</span>
            </span>
          </div>

          <p className="mt-12 flex items-start gap-2.5 border-t border-rule pt-6 text-[12.5px] leading-relaxed text-text-3 text-pretty">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-ink"
              aria-hidden
            />
            <span>
              <span className="text-text-1">Safety note. </span>
              This is a safe reconstruction. All systems, files, hosts,
              credentials, and outputs are simulated. Do not use these
              techniques on systems you do not own or have explicit permission
              to test.
            </span>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
    </DirectionalTransition>
  );
}

function Spec({
  leading,
  k,
  v,
}: {
  leading?: ReactNode;
  k: string;
  v: ReactNode;
}) {
  return (
    <div className="bg-paper-1 px-4 py-3.5">
      <div className="flex items-center gap-1.5 eh-eyebrow">
        {leading}
        {k}
      </div>
      <div className="mt-1.5 font-serif text-[20px] leading-tight text-text-1 tabular-nums">
        {v}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 eh-eyebrow">{title}</h2>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eh-eyebrow">{k}</dt>
      <dd className="mt-1 font-mono text-[13px] text-text-1">{v}</dd>
    </div>
  );
}
