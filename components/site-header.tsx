import Link from "next/link";
import { Archive, Info, Send, ShieldCheck } from "lucide-react";
import { MetadataDot } from "@/components/metadata-dot";
import { scenarios } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const total = scenarios.length;
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-background" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-[24px] leading-none">
            EmulateHacks
          </span>
          <span className="hidden items-center gap-1.5 eh-eyebrow sm:flex">
            terminal museum
            <MetadataDot className="text-text-4" />
            est. 2026
          </span>
        </Link>
        <nav className="flex items-center gap-0.5">
          <NavLink href="/scenarios" icon={Archive}>
            Archive
            <span className="ml-2 rounded-sm border border-rule px-1 py-0.5 text-[10px] tabular-nums text-text-3">
              {String(total).padStart(2, "0")}
            </span>
          </NavLink>
          <NavLink href="/about" icon={Info}>
            About
          </NavLink>
          <NavLink href="/submit" icon={Send}>
            Submit
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof Archive;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/nav inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] text-text-2",
        "transition-colors duration-150 ease-out hover:text-text-1 hover:bg-paper-1",
        "active:translate-y-px",
      )}
    >
      <Icon className="size-3.5 text-text-4 transition-colors group-hover/nav:text-text-2" aria-hidden />
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-serif text-[22px] leading-none text-text-1">
            EmulateHacks
          </span>
          <span className="eh-eyebrow inline-flex items-center gap-1.5">
            a terminal museum
            <MetadataDot className="text-text-4" />
            2026
          </span>
        </div>
        <div className="flex max-w-md items-start gap-3 text-text-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
          <p className="text-pretty text-[12.5px] leading-relaxed">
            Every scenario is fictional or historically abstracted. No real
            hosts, credentials, or networks are reachable from this site.
          </p>
        </div>
      </div>
    </footer>
  );
}
