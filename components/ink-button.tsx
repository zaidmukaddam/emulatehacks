import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const baseClasses =
  "group inline-flex items-center gap-2 rounded-sm border whitespace-nowrap " +
  "transition-[transform,colors,border-color] duration-150 ease-out " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const variantClasses: Record<Variant, string> = {
  primary:
    "border-ink bg-ink text-primary-foreground hover:bg-ink/90 hover:border-ink/90",
  secondary:
    "border-rule-strong bg-paper-1 text-text-1 hover:bg-paper-2 hover:border-rule-strong",
  ghost: "border-transparent text-text-2 hover:text-text-1 hover:bg-paper-1",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2.5 text-[13px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function InkLink({
  href,
  variant = "primary",
  size = "md",
  showArrow = true,
  className,
  transitionTypes,
  children,
}: CommonProps & { href: string; transitionTypes?: string[] }) {
  return (
    <Link
      href={href}
      transitionTypes={transitionTypes}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
      {showArrow && (
        <ArrowRight
          className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function InkButton({
  variant = "primary",
  size = "md",
  showArrow = false,
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
      {showArrow && (
        <ArrowRight
          className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </button>
  );
}
