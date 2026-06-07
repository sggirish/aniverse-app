"use client";
import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const loaded = useRef(false);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (loaded.current || !publisherId) return;
    loaded.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* AdSense not loaded yet */ }
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
