import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getCharacterMatch } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  let character = "Anime Character";
  let anime = "";
  let explanation = "";
  try {
    const m = await getCharacterMatch(id);
    if (m) { character = m.character_name; anime = m.anime_title; explanation = m.explanation.slice(0, 180); }
  } catch { /* ignore */ }

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#EFF6FF", padding: "60px", fontFamily: "system-ui, sans-serif",
        border: "8px solid #BFDBFE",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Character Match · AniVerse
          </span>
        </div>
        <p style={{ fontSize: 20, color: "#6B7280", marginBottom: 8 }}>You are</p>
        <p style={{ fontSize: 56, fontWeight: 900, color: "#0F0F0F", lineHeight: 1, marginBottom: 12 }}>{character}</p>
        <p style={{ fontSize: 22, color: "#2563EB", fontWeight: 600, marginBottom: 32 }}>{anime}</p>
        {explanation && (
          <p style={{ fontSize: 18, color: "#374151", fontStyle: "italic", lineHeight: 1.6 }}>
            &ldquo;{explanation}&rdquo;
          </p>
        )}
        <div style={{ marginTop: "auto", color: "#9CA3AF", fontSize: 14 }}>
          aniverse.app/character/{id}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
