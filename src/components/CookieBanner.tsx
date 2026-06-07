"use client";
import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if not yet acknowledged and AdSense is configured
    if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) return;
    const acknowledged = localStorage.getItem("aniverse_cookies_ok");
    if (!acknowledged) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("aniverse_cookies_ok", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-4 animate-fade-in-up">
      <p className="text-sm text-[#374151] leading-relaxed mb-3">
        We use cookies for ads (Google AdSense). Analytics via{" "}
        <a href="https://plausible.io" target="_blank" rel="noopener noreferrer" className="underline">Plausible</a>{" "}
        — cookieless, GDPR-safe.{" "}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 text-sm font-semibold py-2 px-4 bg-[#0F0F0F] text-white rounded-xl hover:opacity-80 transition-opacity"
        >
          Got it
        </button>
        <a
          href="/privacy"
          className="text-sm font-medium py-2 px-4 border border-[#E5E7EB] rounded-xl hover:bg-[#F3F4F6] transition-colors text-[#6B7280]"
        >
          Learn more
        </a>
      </div>
    </div>
  );
}
