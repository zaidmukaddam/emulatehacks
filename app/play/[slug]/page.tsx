import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaySession } from "@/components/play-session";
import { getScenario, scenarios } from "@/lib/scenarios";
import { DirectionalTransition } from "@/components/directional-transition";

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
  return {
    title: `${s.title} | Live reconstruction`,
    description: s.tagline,
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();
  return (
    <DirectionalTransition>
      <PlaySession scenario={scenario} />
    </DirectionalTransition>
  );
}
