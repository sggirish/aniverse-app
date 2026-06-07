-- AniVerse Database Schema
-- Run this in your Supabase SQL editor

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roast_cache (
  username     text PRIMARY KEY,
  mal_data     jsonb NOT NULL,
  roast_text   text NOT NULL,
  card_image_url text,
  created_at   timestamptz DEFAULT now(),
  expires_at   timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roast_expires ON roast_cache(expires_at);

CREATE TABLE IF NOT EXISTS verdicts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_slug   text UNIQUE NOT NULL,
  anime_title  text NOT NULL,
  mal_id       int,
  verdict      text CHECK (verdict IN ('WATCH','SKIP','WAIT')) NOT NULL,
  reasoning    text NOT NULL,
  for_who      text NOT NULL,
  not_for_who  text NOT NULL,
  test_episode text,
  view_count   int DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verdicts_slug    ON verdicts(anime_slug);
CREATE INDEX IF NOT EXISTS idx_verdicts_popular ON verdicts(view_count DESC);

CREATE TABLE IF NOT EXISTS character_matches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     text NOT NULL,
  answers        jsonb NOT NULL,
  character_name text NOT NULL,
  anime_title    text NOT NULL,
  explanation    text NOT NULL,
  card_image_url text,
  share_count    int DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_char_session ON character_matches(session_id);
-- Partial index for efficient 30-day cleanup
CREATE INDEX IF NOT EXISTS idx_char_created ON character_matches(created_at);

-- ── Helper Functions ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_verdict_view(slug text)
RETURNS void AS $$
  UPDATE verdicts SET view_count = view_count + 1 WHERE anime_slug = slug;
$$ LANGUAGE sql;

-- ── Row Level Security ───────────────────────────────────────────────────────
-- The app uses the service role key (bypasses RLS) so these policies protect
-- against accidental anon key exposure or direct DB access.

ALTER TABLE roast_cache       ENABLE ROW LEVEL SECURITY;
ALTER TABLE verdicts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_matches ENABLE ROW LEVEL SECURITY;

-- verdicts are public read (they are SEO pages)
CREATE POLICY "verdicts_public_read"
  ON verdicts FOR SELECT
  USING (true);

-- all writes require service role (no anon insert/update/delete)
CREATE POLICY "verdicts_service_write"
  ON verdicts FOR ALL
  USING (auth.role() = 'service_role');

-- roast_cache: no public read (contains MAL data)
CREATE POLICY "roast_cache_service_only"
  ON roast_cache FOR ALL
  USING (auth.role() = 'service_role');

-- character_matches: no public read (anonymous but accumulated)
CREATE POLICY "character_matches_service_only"
  ON character_matches FOR ALL
  USING (auth.role() = 'service_role');
