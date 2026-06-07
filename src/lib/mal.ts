import { cacheGet, cacheSet } from "./redis";
import { slugify, sleep } from "./utils";

const JIKAN = "https://api.jikan.moe/v4";

let lastRequestTime = 0;
async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 500) await sleep(500 - elapsed);
  lastRequestTime = Date.now();
}

async function jikanFetch<T>(path: string): Promise<T | null> {
  const cacheKey = `jikan:${path}`;
  const cached = await cacheGet<T>(cacheKey);
  if (cached) return cached;

  await throttle();
  try {
    const res = await fetch(`${JIKAN}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    await cacheSet(cacheKey, json, 3600);
    return json;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface MALUserStats {
  mean_score: number;
  completed: number;
  watching: number;
  dropped: number;
  plan_to_watch: number;
  episodes_watched: number;
}

export interface MALUserProfile {
  username: string;
  mal_id: number;
  about?: string;
  statistics: { anime: MALUserStats };
  joined: string;
}

export interface MALAnimeEntry {
  mal_id: number;
  title: string;
  score: number;
  status: string;
  episodes_watched: number;
  genres: string[];
}

export interface AnimeData {
  mal_id: number;
  title: string;
  slug: string;
  synopsis?: string;
  genres: string[];
  score?: number;
  episodes?: number;
  status?: string;
  image_url?: string;
}

// ── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(username: string): Promise<MALUserProfile | null> {
  const data = await jikanFetch<{ data: MALUserProfile }>(`/users/${username}`);
  return data?.data ?? null;
}

// ── User Anime List ──────────────────────────────────────────────────────────

export async function getUserAnimeList(username: string): Promise<MALAnimeEntry[]> {
  const data = await jikanFetch<{ data: Array<{ node: { id: number; title: string; genres?: Array<{ name: string }> }; list_status: { status: string; score: number; num_episodes_watched: number } }> }>(
    `/users/${username}/animelist?status=all&limit=300`
  );
  if (!data?.data) return [];
  return data.data.map((entry) => ({
    mal_id: entry.node?.id ?? 0,
    title: entry.node?.title ?? "",
    score: entry.list_status?.score ?? 0,
    status: entry.list_status?.status ?? "",
    episodes_watched: entry.list_status?.num_episodes_watched ?? 0,
    genres: (entry.node?.genres ?? []).map((g) => g.name),
  }));
}

// ── Search Anime ─────────────────────────────────────────────────────────────

export async function searchAnime(query: string): Promise<AnimeData[]> {
  const data = await jikanFetch<{ data: Array<{ mal_id: number; title: string; synopsis?: string; genres?: Array<{ name: string }>; score?: number; episodes?: number; status?: string; images?: { jpg?: { image_url?: string } } }> }>(
    `/anime?q=${encodeURIComponent(query)}&limit=5&sfw=true`
  );
  if (!data?.data) return [];
  return data.data.map((a) => ({
    mal_id: a.mal_id,
    title: a.title,
    slug: slugify(a.title),
    synopsis: a.synopsis,
    genres: (a.genres ?? []).map((g) => g.name),
    score: a.score,
    episodes: a.episodes,
    status: a.status,
    image_url: a.images?.jpg?.image_url,
  }));
}

// ── Get Anime by ID ──────────────────────────────────────────────────────────

export async function getAnimeById(id: number): Promise<AnimeData | null> {
  const data = await jikanFetch<{ data: { mal_id: number; title: string; synopsis?: string; genres?: Array<{ name: string }>; score?: number; episodes?: number; status?: string; images?: { jpg?: { image_url?: string } } } }>(
    `/anime/${id}/full`
  );
  if (!data?.data) return null;
  const a = data.data;
  return {
    mal_id: a.mal_id,
    title: a.title,
    slug: slugify(a.title),
    synopsis: a.synopsis,
    genres: (a.genres ?? []).map((g) => g.name),
    score: a.score,
    episodes: a.episodes,
    status: a.status,
    image_url: a.images?.jpg?.image_url,
  };
}

// ── Summarize MAL list for Claude ────────────────────────────────────────────

export function summarizeMALList(list: MALAnimeEntry[], profile: MALUserProfile) {
  const scored = list.filter((a) => a.score > 0);
  const genreCount: Record<string, number> = {};
  list.forEach((a) => a.genres.forEach((g) => { genreCount[g] = (genreCount[g] ?? 0) + 1; }));
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([g]) => g);

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const topRated = sorted.slice(0, 3).map((a) => `${a.title} (${a.score})`);
  const worstRated = sorted.slice(-3).map((a) => `${a.title} (${a.score})`);

  const titleCount: Record<string, number> = {};
  list.forEach((a) => {
    const base = a.title.split(":")[0].trim();
    titleCount[base] = (titleCount[base] ?? 0) + a.episodes_watched;
  });
  const mostWatched = Object.entries(titleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([t]) => t)[0];

  return {
    username: profile.username,
    mean_score: profile.statistics.anime.mean_score,
    completed: profile.statistics.anime.completed,
    dropped: profile.statistics.anime.dropped,
    episodes_watched: profile.statistics.anime.episodes_watched,
    top_genres: topGenres,
    top_rated: topRated,
    worst_rated: worstRated,
    most_watched_franchise: mostWatched,
  };
}
