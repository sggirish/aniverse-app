import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getVerdict } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  let title = "Anime Verdict";
  let verdict = "WATCH";
  let forWho = "";
  try {
    const v = await getVerdict(slug);
    if (v) { title = v.anime_title; verdict = v.verdict; forWho = v.for_who; }
  } catch { /* ignore */ }

  const colors = { WATCH: "#16A34A", SKIP: "#DC2626", WAIT: "#D97706" };
  const icons  = { WATCH: "✅", SKIP: "❌", WAIT: "⏳" };
  const color  = colors[verdict as keyof typeof colors] ?? "#16A34A";
  const icon   = icons[verdict as keyof typeof icons] ?? "✅";

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FAFAF9", padding: "60px", fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Should I Watch?
          </span>
        </div>
        <p style={{ fontSize: 42, fontWeight: 900, color: "#0F0F0F", marginBottom: 28, lineHeight: 1.1 }}>{title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 28 }}>
          <span style={{ fontSize: 48 }}>{icon}</span>
          <span style={{ fontSize: 52, fontWeight: 900, color }}>{verdict}</span>
        </div>
        {forWho && (
          <p style={{ fontSize: 20, color: "#6B7280", lineHeight: 1.5 }}>{forWho}</p>
        )}
        <div style={{ marginTop: "auto", borderTop: "1px solid #E5E7EB", paddingTop: 20, color: "#9CA3AF", fontSize: 14 }}>
          aniverse.app/watch/{slug}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
