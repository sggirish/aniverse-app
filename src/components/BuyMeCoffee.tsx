"use client";
import { useEffect, useState } from "react";

export function BuyMeCoffee() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const used = localStorage.getItem("anideck_used_tool");
    if (used) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <a
      href={process.env.NEXT_PUBLIC_BMC_URL ?? "https://buymeacoffee.com"}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 bg-[#FFDD00] text-[#0F0F0F] font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      ☕ Support AniDeck
    </a>
  );
}
