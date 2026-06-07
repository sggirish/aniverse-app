"use client";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  text: string;
}

export function ShareButtons({ url, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${url}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + fullUrl)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Post on X
      </a>
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.524 5.84L.057 23.928l6.207-1.462A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.032-1.381l-.361-.214-3.735.979.996-3.648-.235-.374A9.86 9.86 0 012.118 12c0-5.44 4.442-9.882 9.882-9.882 5.441 0 9.883 4.442 9.883 9.882 0 5.441-4.442 9.882-9.883 9.882z"/>
        </svg>
        WhatsApp
      </a>
      <button onClick={copy}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:bg-[#F3F4F6] transition-colors">
        {copied ? (
          <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Copied!</>
        ) : (
          <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy link</>
        )}
      </button>
    </div>
  );
}
