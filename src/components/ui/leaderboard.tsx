"use client";
import type { LeaderboardEntry } from "@/lib/games";

interface Props {
  entries: LeaderboardEntry[];
  mySessionId?: string;
  label?: string;
  showAccuracy?: boolean;
  showTime?: boolean;
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function timeStr(s?: number) {
  if (!s) return null;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ entries, mySessionId, label = "Top Players", showAccuracy, showTime }: Props) {
  if (!entries.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">{label}</p>
      </div>
      <div className="divide-y divide-[#F9F9F9]">
        {entries.map((e, i) => {
          const isMe = e.session_id === mySessionId;
          return (
            <div key={e.session_id + i}
              className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-[#F0FDF4]" : ""}`}>
              <span className="w-6 text-center text-sm shrink-0">
                {i < 3 ? MEDALS[i] : <span className="text-xs text-[#9CA3AF] font-bold">#{i + 1}</span>}
              </span>
              <span className={`flex-1 text-xs font-mono font-bold ${isMe ? "text-[#16A34A]" : "text-[#374151]"}`}>
                {shortId(e.session_id)}{isMe ? " (you)" : ""}
              </span>
              {showAccuracy && e.accuracy != null && (
                <span className="text-xs text-[#9CA3AF] shrink-0">{e.accuracy}%</span>
              )}
              {showTime && e.time_seconds != null && (
                <span className="text-xs text-[#9CA3AF] shrink-0">{timeStr(e.time_seconds)}</span>
              )}
              <span className="text-sm font-black text-[#0F0F0F] shrink-0">{e.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
