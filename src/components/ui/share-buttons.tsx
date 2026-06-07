"use client";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;       // relative path e.g. /character/abc
  text: string;      // share caption
  title?: string;    // used in native share sheet
  platform?: string; // optional label
}

export function ShareButtons({ url, text, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Always use window.location.origin — never trust NEXT_PUBLIC_APP_URL on client
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${origin}${url}`;

  // Clean share text — no emojis that break on some platforms, include the URL
  const shareText = `${text}\n\n${fullUrl}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: title ?? "AniVerse", text, url: fullUrl });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch { /* user cancelled */ }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="space-y-3">
      {/* Share preview card */}
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0F0F0F] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
            <path d="M7 21L14 7L21 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.8 16.5H18.2" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
            <circle cx="14" cy="12" r="1.2" fill="#DC2626"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#0F0F0F] truncate">{title ?? "AniVerse"}</p>
          <p className="text-[10px] text-[#9CA3AF] truncate">{fullUrl}</p>
        </div>
        <button onClick={copy}
          className="text-[10px] font-bold px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9F9F9] shrink-0 transition-colors text-[#6B7280]">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share buttons row */}
      <div className="flex gap-2 flex-wrap">

        {/* X/Twitter */}
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-black text-white hover:bg-[#1a1a1a] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Post on X
        </a>

        {/* WhatsApp */}
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.524 5.84L.057 23.928l6.207-1.462A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.032-1.381l-.361-.214-3.735.979.996-3.648-.235-.374A9.86 9.86 0 012.118 12c0-5.44 4.442-9.882 9.882-9.882 5.441 0 9.883 4.442 9.883 9.882 0 5.441-4.442 9.882-9.883 9.882z"/>
          </svg>
          WhatsApp
        </a>

        {/* Native share (mobile) */}
        {canNativeShare && (
          <button onClick={nativeShare}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            {shared ? "Shared!" : "More"}
          </button>
        )}

        {/* Copy link — desktop fallback */}
        {!canNativeShare && (
          <button onClick={copy}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:bg-[#F3F4F6] transition-colors">
            {copied ? (
              <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy link</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
