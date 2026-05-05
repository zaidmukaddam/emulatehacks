import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DirectionalTransition } from "@/components/directional-transition";

export const metadata: Metadata = {
  title: "About",
  description: "What EmulateHacks is, how it works, and what it will never be.",
};

export default function AboutPage() {
  return (
    <DirectionalTransition>
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-20">
          <div className="flex items-center gap-2 eh-eyebrow">
            <Info className="size-3 text-ink" aria-hidden />
            About
          </div>
          <h1 className="mt-3 font-serif text-[44px] leading-[1.05] text-balance text-text-1 sm:text-[56px]">
            A museum that you can{" "}
            <span className="italic text-ink">type inside.</span>
          </h1>

          <Section title="What this is">
            <p>
              EmulateHacks is a small archive of iconic terminal-era hacks,
              security incidents, and command-line moments, recreated as
              interactive, scripted browser sessions. You get the briefing, you
              walk the system, you read the debrief.
            </p>
            <p>
              It was built because most security writing happens at the wrong
              level. Blog posts explain. Conference talks narrate. CTFs
              challenge. Few things let you sit at the prompt the way the
              person who lived through the incident did, with the same files in
              the same place, and type your way through it.
            </p>
          </Section>

          <Section title="What this is not">
            <p>
              It is not a hacking tutorial. It is not a CTF platform. It does
              not run real shells. It cannot reach a real network. It will
              never publish working exploit code, real credentials, real
              targets, or playbooks for getting into systems you do not own.
            </p>
            <p>
              Every &ldquo;system&rdquo; you see is a small in-memory map of
              filenames to strings. Every command is matched against a
              whitelist. Every piece of output was written to be read.
            </p>
          </Section>

          <Section title="How a scenario works">
            <p>
              Each exhibit ships with a fictional or historically abstracted
              filesystem, a numbered list of steps, and a short narrative arc.
              When the engine recognises a step&rsquo;s expected command, it
              prints a quiet line of narration and unlocks the next step. If
              you get stuck, type <Mono>hint</Mono>. If you want to look around
              freely, every exhibit is also explorable: the steps gate the
              story, not the prompt.
            </p>
          </Section>

          <Section title="The terminal layer">
            <p>
              The browser terminal is{" "}
              <a
                href="https://wterm.dev/"
                className="eh-link text-text-1"
                target="_blank"
                rel="noreferrer"
              >
                wterm
              </a>
              , a DOM-rendered VT220-class emulator with a Zig core compiled to
              WASM. It gives you native text selection, browser find, real
              copy-paste, accessibility: all the things a canvas terminal
              can&rsquo;t. Behind it sits a small custom shell that knows how
              to walk a flat virtual filesystem and refuses politely when you
              ask it to do anything unsafe.
            </p>
          </Section>

          <Section title="Safety, in the long form">
            <p>
              EmulateHacks is an educational simulation platform. All
              environments are fictional, sandboxed, or historically
              abstracted. The platform does not provide access to real
              targets, real credentials, live exploitation infrastructure, or
              malware. Historical reconstructions are abstracted so they teach
              the shape of the incident without becoming a recipe.
            </p>
            <p>
              If you are a teacher, a security trainer, or a journalist and
              would like a specific incident reconstructed responsibly, please{" "}
              <Link href="/submit" className="eh-link text-text-1">
                submit a request
              </Link>
              .
            </p>
          </Section>

          <Section title="Makers">
            <p>
              EmulateHacks was designed and built by{" "}
              <a
                href="https://zaidmukaddam.com"
                className="eh-link text-text-1"
                target="_blank"
                rel="noreferrer"
              >
                Zaid Mukaddam
              </a>
              .
            </p>
          </Section>
        </article>
      </main>
      <SiteFooter />
    </div>
    </DirectionalTransition>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-3 eh-eyebrow">{title}</h2>
      <div className="space-y-4 text-pretty text-[14.5px] leading-relaxed text-text-2 [&_p]:max-w-2xl">
        {children}
      </div>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border border-rule bg-paper-1 px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
      {children}
    </code>
  );
}
