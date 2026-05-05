import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://emulatehacks.com"),
  title: {
    default: "EmulateHacks, Replay hacker history in your browser",
    template: "%s | EmulateHacks",
  },
  description:
    "A playable terminal museum for iconic hacks, security incidents, and command-line moments from computing history. Every scenario is safely simulated.",
  openGraph: {
    title: "EmulateHacks",
    description:
      "Replay hacker history in your browser. Safe, scripted terminal reconstructions of iconic security incidents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
