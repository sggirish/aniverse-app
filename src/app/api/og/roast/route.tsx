import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getRoastCache } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "unknown";
  let roastText = "Their anime taste got roasted by AI.";
  try {
    const cache = await getRoastCache(username);
    if (cache) roastText = cache.roast_text.slice(0, 200);
  } catch { /* ignore */ }

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FAF9F6", padding: "60px", fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <span style={{ fontSize: 32 }}>🔥</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Anime Roast
          </span>
        </div>
        <p style={{ fontSize: 28, fontWeight: 800, color: "#0F0F0F", marginBottom: 24, lineHeight: 1.2 }}>
          {username}&apos;s anime taste got roasted
        </p>
        <p style={{ fontSize: 18, color: "#374151", fontStyle: "italic", lineHeight: 1.6, flex: 1 }}>
          &ldquo;{roastText}&rdquo;
        </p>
        <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 20, color: "#9CA3AF", fontSize: 14 }}>
          aniverse.app/roast/{username}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
