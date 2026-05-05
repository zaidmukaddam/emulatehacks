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
          <a
            href="https://x.com/zaidmukaddam"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className={cn(
              "inline-flex items-center justify-center rounded-sm p-2 text-text-3",
              "transition-colors duration-150 ease-out hover:text-text-1 hover:bg-paper-1",
              "active:translate-y-px",
            )}
          >
            <XIcon className="size-3.5" aria-hidden />
          </a>
          <a
            href="https://github.com/zaidmukaddam/emulatehacks"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className={cn(
              "inline-flex items-center justify-center rounded-sm p-2 text-text-3",
              "transition-colors duration-150 ease-out hover:text-text-1 hover:bg-paper-1",
              "active:translate-y-px",
            )}
          >
            <GitHubIcon className="size-3.5" aria-hidden />
          </a>
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

function XIcon({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1227"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
    </svg>
  );
}

function GitHubIcon({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
        transform="scale(64)"
      />
    </svg>
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
