import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline separator dot (replaces punctuation middots in UI). */
export function MetadataDot({ className }: { className?: string }) {
  return (
    <Dot
      className={cn(
        "inline-block size-2 shrink-0 translate-y-[-2px] fill-current",
        className,
      )}
      aria-hidden
    />
  );
}
