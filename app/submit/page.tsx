import type { Metadata } from "next";
import { Send } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DirectionalTransition } from "@/components/directional-transition";

export const metadata: Metadata = {
  title: "Submit an exhibit",
  description: "Suggest an incident or moment for the archive.",
};

export default function SubmitPage() {
  return (
    <DirectionalTransition>
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-20">
          <div className="flex items-center gap-2 eh-eyebrow">
            <Send className="size-3 text-ink" aria-hidden />
            Submit
          </div>
          <h1 className="mt-3 font-serif text-[44px] leading-[1.05] text-balance text-text-1 sm:text-[56px]">
            Suggest the next exhibit.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-[14px] leading-relaxed text-text-3">
            What incident or terminal moment do you wish more people understood
            from the inside? Send a short note and a few links. Defensive
            angles and historical reconstructions move to the front of the
            queue.
          </p>

          <form
            action="https://formspree.io/f/placeholder"
            method="POST"
            className="mt-12 grid gap-5"
          >
            <Field
              label="Title"
              name="title"
              placeholder="The Forgotten Cron Job"
            />
            <Field
              label="One-line pitch"
              name="pitch"
              placeholder="Persistence found in a runner that nobody owned"
            />
            <Field
              label="Why it should exist as an exhibit"
              name="reason"
              textarea
              placeholder="What makes this teachable? What would a visitor walk away understanding?"
            />
            <Field
              label="Sources or references (optional)"
              name="sources"
              textarea
              placeholder="Links to public writeups, post-mortems, or documentation."
            />
            <Field
              label="Your contact (optional)"
              name="contact"
              placeholder="email or handle"
            />
            <div className="flex items-center justify-between gap-4 border-t border-rule pt-5">
              <p className="max-w-md text-[12px] leading-relaxed text-text-3">
                Submissions are reviewed manually. Anything weaponised, real,
                or actionable is rejected by default.
              </p>
              <button
                type="submit"
                className="group inline-flex items-center gap-2 rounded-sm border border-ink bg-ink px-4 py-2 text-[13px] text-primary-foreground transition-[transform,colors] duration-150 ease-out hover:bg-ink/90 active:scale-[0.97]"
              >
                Send
                <Send
                  className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </div>
          </form>
        </article>
      </main>
      <SiteFooter />
    </div>
    </DirectionalTransition>
  );
}

function Field({
  label,
  name,
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const sharedClass =
    "rounded-sm border border-rule bg-paper-1 px-3 py-2.5 font-mono text-[13.5px] text-text-1 " +
    "placeholder:text-text-4 transition-colors duration-150 ease-out " +
    "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <label className="grid gap-2">
      <span className="eh-eyebrow">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          placeholder={placeholder}
          className={`resize-y ${sharedClass}`}
        />
      ) : (
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          className={sharedClass}
        />
      )}
    </label>
  );
}
