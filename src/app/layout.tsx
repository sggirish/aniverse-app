import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BuyMeCoffee } from "@/components/BuyMeCoffee";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "AniVerse — Free AI Anime Tools", template: "%s | AniVerse" },
  description: "Roast your anime taste, get a verdict on any anime, find your character match. 100% free, no account needed.",
  openGraph: {
    type: "website",
    siteName: "AniVerse",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Plausible Analytics — privacy-first, cookieless */}
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.tagged-events.js"
          />
        )}
        {/* Google AdSense — lazy loaded after content */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF9]">
        {/* Desktop header */}
        <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-20 hidden sm:block">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity">
              ANIVERSE
            </Link>
            <nav className="flex items-center gap-1">
              {[
                { href: "/roast",     label: "🔥 Roast" },
                { href: "/watch",     label: "▶ Verdict" },
                { href: "/character", label: "◉ Character" },
              ].map((n) => (
                <Link key={n.href} href={n.href}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg text-[#6B7280] hover:text-[#0F0F0F] hover:bg-[#F3F4F6] transition-all">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Mobile header */}
        <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-20 sm:hidden">
          <div className="px-4 h-12 flex items-center">
            <Link href="/" className="text-lg font-black tracking-tighter">ANIVERSE</Link>
          </div>
        </header>

        <div className="flex-1 pb-16 sm:pb-0">
          {children}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-20">
          <div className="grid grid-cols-3 h-16">
            {[
              { href: "/roast",     icon: "🔥", label: "Roast" },
              { href: "/watch",     icon: "▶",  label: "Verdict" },
              { href: "/character", icon: "◉",  label: "Character" },
            ].map((t) => (
              <Link key={t.href} href={t.href}
                className="flex flex-col items-center justify-center gap-0.5 text-[#6B7280] hover:text-[#0F0F0F] transition-colors">
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <footer className="border-t border-[#E5E7EB] bg-white py-6 hidden sm:block">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#9CA3AF]">
            <span>AniVerse · Built by Girish R. · 2026</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[#6B7280]">Privacy</Link>
              <Link href="/terms"   className="hover:text-[#6B7280]">Terms</Link>
              <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#6B7280]">Support AniVerse ☕</a>
            </div>
          </div>
        </footer>

        {/* Buy Me a Coffee — shows after user has used a tool */}
        <BuyMeCoffee />

        {/* Cookie consent — only shown when AdSense is enabled */}
        <CookieBanner />
      </body>
    </html>
  );
}
