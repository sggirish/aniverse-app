import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  return _supabase;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface RoastCache {
  username: string;
  mal_data: Record<string, unknown>;
  roast_text: string;
  card_image_url?: string;
  created_at: string;
  expires_at: string;
}

export interface VerdictMetadata {
  hook?: string;
  one_line?: string;
  binge_score?: number;
  vibe_tags?: string[];
  similar_anime?: string[];
}

export interface Verdict {
  id: string;
  anime_slug: string;
  anime_title: string;
  mal_id?: number;
  image_url?: string;
  verdict: "WATCH" | "SKIP" | "WAIT";
  reasoning: string;
  for_who: string;
  not_for_who: string;
  test_episode?: string;
  metadata?: VerdictMetadata;
  view_count: number;
  created_at: string;
}

export interface CharacterMatch {
  id: string;
  session_id: string;
  answers: Record<string, string>;
  character_name: string;
  anime_title: string;
  explanation: string;
  secondary_character?: string;
  secondary_anime?: string;
  archetype?: string;
  card_image_url?: string;
  share_count: number;
  created_at: string;
}

// ── Roast Cache ──────────────────────────────────────────────────────────────

export async function getRoastCache(username: string): Promise<RoastCache | null> {
  const { data } = await supabase()
    .from("roast_cache")
    .select("*")
    .eq("username", username.toLowerCase())
    .gt("expires_at", new Date().toISOString())
    .single();
  return data;
}

export async function setRoastCache(
  username: string,
  malData: Record<string, unknown>,
  roastText: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await supabase().from("roast_cache").upsert({
    username: username.toLowerCase(),
    mal_data: malData,
    roast_text: roastText,
    expires_at: expiresAt,
  });
}

// ── Verdicts ─────────────────────────────────────────────────────────────────

export async function getVerdict(slug: string): Promise<Verdict | null> {
  const { data } = await supabase()
    .from("verdicts")
    .select("*")
    .eq("anime_slug", slug)
    .single();
  return data;
}

export async function setVerdict(v: Omit<Verdict, "id" | "view_count" | "created_at">): Promise<Verdict | null> {
  const { data } = await supabase()
    .from("verdicts")
    .insert(v)
    .select()
    .single();
  return data;
}

export async function incrementVerdictView(slug: string): Promise<void> {
  await supabase().rpc("increment_verdict_view", { slug });
}

export async function getTrendingVerdicts(limit = 6): Promise<Verdict[]> {
  const { data } = await supabase()
    .from("verdicts")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllVerdictSlugs(): Promise<string[]> {
  const { data } = await supabase().from("verdicts").select("anime_slug");
  return (data ?? []).map((d) => d.anime_slug);
}

// ── Character Matches ────────────────────────────────────────────────────────

export async function createCharacterMatch(
  match: Omit<CharacterMatch, "id" | "share_count" | "created_at">
): Promise<CharacterMatch | null> {
  const { data } = await supabase()
    .from("character_matches")
    .insert(match)
    .select()
    .single();
  return data;
}

export async function getCharacterMatch(id: string): Promise<CharacterMatch | null> {
  const { data } = await supabase()
    .from("character_matches")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}
