import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/redis";

interface NewsItem {
  title: string;
  url: string;
  image_url?: string;
  published: string;
  source: string;
  category: string;
}

async function fetchAniListNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { Page(page:1,perPage:20) { activities(type:ANIME_LIST,sort:ID_DESC,isFollowing:false) {
          ... on ListActivity { status media { title { romaji } coverImage { medium } siteUrl } createdAt }
        } } }`,
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return [];
  } catch {
    return [];
  }
}

async function fetchJikanNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://api.jikan.moe/v4/anime/seasonal/now?limit=20", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).slice(0, 12).map((a: Record<string, unknown>) => ({
      title: `Now Airing: ${(a.title as string) ?? "Unknown"}`,
      url: (a.url as string) ?? "#",
      image_url: ((a.images as Record<string, Record<string, string>>)?.jpg?.image_url) ?? undefined,
      published: new Date().toISOString(),
      source: "MyAnimeList",
      category: "Currently Airing",
    }));
  } catch {
    return [];
  }
}

async function fetchAnnNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://www.animenewsnetwork.com/all/rss.xml?ann-edition=us",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const text = await res.text();
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
      const block = match[1];
      const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(block);
      const linkMatch = /<link>(.*?)<\/link>/.exec(block);
      const pubMatch = /<pubDate>(.*?)<\/pubDate>/.exec(block);
      const encMatch = /<enclosure[^>]*url="([^"]*)"/.exec(block);
      if (titleMatch && linkMatch) {
        items.push({
          title: (titleMatch[1] ?? titleMatch[2] ?? "").trim(),
          url: linkMatch[1].trim(),
          image_url: encMatch?.[1],
          published: pubMatch ? new Date(pubMatch[1]).toISOString() : new Date().toISOString(),
          source: "Anime News Network",
          category: "Industry News",
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const cacheKey = `news:feed:${new Date().toISOString().slice(0, 13)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [annNews, jikanAiring] = await Promise.all([fetchAnnNews(), fetchJikanNews()]);
  const allNews = [...annNews, ...jikanAiring].slice(0, 24);

  const result = { articles: allNews, generated_at: new Date().toISOString() };
  await cacheSet(cacheKey, result, 3600);
  return NextResponse.json(result);
}
