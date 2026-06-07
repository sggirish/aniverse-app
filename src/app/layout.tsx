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
  title: { default: "AniDeck — Free AI Anime Tools", template: "%s | AniDeck" },
  description: "Roast your anime taste, get a verdict on any anime, find your character match. 100% free, no account needed.",
  openGraph: {
    type: "website",
    siteName: "AniDeck",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="#0F0F0F"/>
      {/* stylised A — two diagonal strokes + crossbar */}
      <path d="M7 21L14 7L21 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.8 16.5H18.2" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
      {/* small accent dot — anime eye motif */}
      <circle cx="14" cy="12" r="1.2" fill="#DC2626"/>
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.tagged-events.js"
          />
        )}
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
        <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm sticky top-0 z-20 hidden sm:block">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <Logo />
              <span className="text-lg font-black tracking-tight">ANIVERSE</span>
            </Link>
            <nav className="flex items-center gap-1">
              {[
                { href: "/roast",         label: "🔥 Roast",     color: "hover:text-[#DC2626]" },
                { href: "/watch",         label: "▶ Verdict",    color: "hover:text-[#16A34A]" },
                { href: "/character",     label: "◉ Character",  color: "hover:text-[#2563EB]" },
                { href: "/mood",          label: "🎭 Mood",       color: "hover:text-[#7C3AED]" },
                { href: "/games",         label: "🎮 Games",      color: "hover:text-[#8B5CF6]" },
                { href: "/season",        label: "📅 Season",     color: "hover:text-[#3B82F6]" },
                { href: "/news",          label: "📰 News",       color: "hover:text-[#10B981]" },
              ].map((n) => (
                <Link key={n.href} href={n.href}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg text-[#6B7280] ${n.color} hover:bg-[#F3F4F6] transition-all`}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Mobile header */}
        <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm sticky top-0 z-20 sm:hidden">
          <div className="px-4 h-12 flex items-center gap-2">
            <Logo />
            <Link href="/" className="text-base font-black tracking-tight">ANIVERSE</Link>
          </div>
        </header>

        <div className="flex-1 pb-16 sm:pb-0">
          {children}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E5E7EB] z-20">
          <div className="grid grid-cols-5 h-16">
            {[
              { href: "/roast",     icon: "🔥", label: "Roast",     active: "#DC2626" },
              { href: "/watch",     icon: "▶",  label: "Verdict",   active: "#16A34A" },
              { href: "/character", icon: "◉",  label: "Char",      active: "#2563EB" },
              { href: "/mood",      icon: "🎭", label: "Mood",      active: "#7C3AED" },
              { href: "/games",     icon: "🎮", label: "Games",     active: "#8B5CF6" },
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
            <div className="flex items-center gap-2">
              <Logo />
              <span>AniDeck · Built by Bhairav · 2026</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link href="/games"    className="hover:text-[#6B7280]">Games</Link>
              <Link href="/news"     className="hover:text-[#6B7280]">News</Link>
              <Link href="/wrapped"  className="hover:text-[#6B7280]">Wrapped</Link>
              <Link href="/pro"      className="hover:text-[#6B7280]">Pro</Link>
              <Link href="/api-docs" className="hover:text-[#6B7280]">API</Link>
              <Link href="/privacy"  className="hover:text-[#6B7280]">Privacy</Link>
              <Link href="/terms"    className="hover:text-[#6B7280]">Terms</Link>
              <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#6B7280]">Support AniDeck ☕</a>
            </div>
          </div>
        </footer>

        <BuyMeCoffee />
        <CookieBanner />
      </body>
    </html>
  );
}
