import Anthropic from "@anthropic-ai/sdk";
import type { AnimeData } from "./mal";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Roast types ───────────────────────────────────────────────────────────────

export interface TasteDNA {
  mainstream: number;
  patience: number;
  darkness: number;
  emotional_depth: number;
  completion_rate: number;
}

export interface RoastResult {
  personality_type: string;
  roast_tier: string;
  taste_dna: TasteDNA;
  taste_sins: string[];
  redemption_arc: string[];
  roast_text: string;
}

// ── Verdict types ─────────────────────────────────────────────────────────────

export interface VerdictResult {
  verdict: "WATCH" | "SKIP" | "WAIT";
  hook: string;
  one_line: string;
  binge_score: number;
  vibe_tags: string[];
  reasons: string[];
  for_who: string;
  not_for_who: string;
  test_episode: string;
  similar_anime: string[];
}

// ── Character Match types ─────────────────────────────────────────────────────

export interface CharacterMatchResult {
  primary_character: string;
  primary_anime: string;
  primary_percent: number;
  secondary_character: string;
  secondary_anime: string;
  secondary_percent: number;
  archetype: string;
  explanation: string;
  shadow_note: string;
}

export interface QuizAnswers {
  q1: "A" | "B" | "C" | "D";
  q2: "A" | "B" | "C" | "D";
  q3: "A" | "B" | "C" | "D";
  q4: "A" | "B" | "C" | "D";
  q5: "A" | "B" | "C" | "D";
  q6: "A" | "B" | "C" | "D";
  q7: "A" | "B" | "C" | "D";
  q8: "A" | "B" | "C" | "D";
}

// ── Mood Finder types ─────────────────────────────────────────────────────────

export interface MoodRec {
  title: string;
  why: string;
  episodes: string;
  hook: string;
  genre: string;
}

export interface MoodResult {
  mood_label: string;
  recommendations: MoodRec[];
}

// ── Roast ────────────────────────────────────────────────────────────────────

export async function generateRoast(malSummary: {
  username: string;
  mean_score: number;
  completed: number;
  dropped: number;
  episodes_watched: number;
  top_genres: string[];
  top_rated: string[];
  worst_rated: string[];
  most_watched_franchise: string;
}): Promise<RoastResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 900,
    system:
      "You are a brutally honest, witty anime critic who roasts people's taste. You are specific, funny, and loving underneath. You must respond with valid JSON only — no extra text.",
    messages: [
      {
        role: "user",
        content: `Analyze this anime watcher and generate a structured roast profile:

Username: ${malSummary.username}
Mean score: ${malSummary.mean_score}/10
Completed: ${malSummary.completed} anime
Dropped: ${malSummary.dropped} anime
Episodes watched: ${malSummary.episodes_watched}
Top genres: ${malSummary.top_genres.join(", ")}
Highest rated: ${malSummary.top_rated.join(", ")}
Lowest rated: ${malSummary.worst_rated.join(", ")}
Most watched franchise: ${malSummary.most_watched_franchise}

Output as JSON:
{
  "personality_type": "Creative nickname for their anime personality (e.g. 'The Shonen Grinder', 'The Hidden Gem Archaeologist', 'The Emotional Masochist', 'The Casual Tourist')",
  "roast_tier": "Funny tier label like 'Certified Mid-Tier Weeb' or 'Dangerous Coomer' or 'Battle-Hardened Veteran' or 'Confused Normie'",
  "taste_dna": {
    "mainstream": <1-10 based on how mainstream their genres/titles are>,
    "patience": <1-10 based on dropped count and genre preference>,
    "darkness": <1-10 based on dark genre preference>,
    "emotional_depth": <1-10 based on emotional genre engagement>,
    "completion_rate": <1-10 based on completed vs dropped ratio>
  },
  "taste_sins": [
    "Specific funny callout #1 mentioning actual shows or scores",
    "Specific funny callout #2",
    "Specific funny callout #3"
  ],
  "redemption_arc": ["First anime to fix their taste", "Second anime"],
  "roast_text": "2-3 sentences of brutally honest but loving roast. Be specific and personal. Reference their actual data. End with a tiny shred of hope."
}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as RoastResult;
}

// ── Verdict ──────────────────────────────────────────────────────────────────

export async function generateVerdict(anime: AnimeData): Promise<VerdictResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system:
      "You are a confident, opinionated anime critic. You give fast, honest verdicts that feel personal. No spoilers. Your verdicts are respected because you have taste and you commit. Always respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: `Generate a rich verdict for "${anime.title}".
Genres: ${anime.genres.join(", ")}
MAL Score: ${anime.score ?? "N/A"}
Episodes: ${anime.episodes ?? "Unknown"}
Synopsis: ${anime.synopsis?.slice(0, 400) ?? "N/A"}

Output as JSON:
{
  "verdict": "WATCH" | "SKIP" | "WAIT",
  "hook": "One irresistible sentence that makes someone want to watch or confirms their instinct to skip — no spoilers",
  "one_line": "The most direct, confident statement about this anime's core value or flaw",
  "binge_score": <1-10, how addictive and hard-to-stop-watching>,
  "vibe_tags": ["3-5 short mood/vibe labels e.g. 'Mind Games', 'Slow Burn', 'Emotional Gut-Punch', 'Don't Watch Alone', 'Peak Shonen'"],
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "for_who": "One sentence describing exactly who will love this",
  "not_for_who": "One sentence describing who should avoid it",
  "test_episode": "Episode number (just the number) that best represents the whole series",
  "similar_anime": ["Similar title 1", "Similar title 2"]
}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as VerdictResult;
}

// ── Character Match ──────────────────────────────────────────────────────────

const QUIZ_LABELS: Record<string, Record<string, string>> = {
  q1: {
    A: "fix it quietly, without telling anyone",
    B: "talk it out until it makes sense",
    C: "spiral first, then recover",
    D: "go completely quiet and withdraw",
  },
  q2: {
    A: "discipline — you show up even when you don't want to",
    B: "empathy — you feel what others feel before they say it",
    C: "intensity — everything matters too much",
    D: "independence — you never needed anyone's permission",
  },
  q3: {
    A: "someone carrying too much, silently",
    B: "someone still searching for the right direction",
    C: "someone rebuilding themselves from scratch",
    D: "someone running — from what, you're not sure",
  },
  q4: {
    A: "the one who keeps things moving",
    B: "the one everyone confides in",
    C: "the wildcard — unpredictable, but interesting",
    D: "the observer — quiet, but notices everything",
  },
  q5: {
    A: "clarity — just tell me what to do",
    B: "connection — someone who truly gets it",
    C: "freedom — no expectations, no obligations",
    D: "recognition — to be seen for who you really are",
  },
  q6: {
    A: "pour everything in, become obsessed",
    B: "protect it quietly without making a big deal",
    C: "want everyone else to care about it too",
    D: "study it, understand every dimension of it",
  },
  q7: {
    A: "respect it when earned, ignore it when not",
    B: "work within it better than anyone",
    C: "challenge it — not out of rebellion but principle",
    D: "observe it carefully from a distance",
  },
  q8: {
    A: "a record — proof that you were here and it mattered",
    B: "better people — those you helped become themselves",
    C: "questions — things that made others think differently",
    D: "nothing visible — you prefer to act without leaving a trace",
  },
};

export async function generateCharacterMatch(answers: QuizAnswers): Promise<CharacterMatchResult> {
  const formatted = [
    `When things go wrong: ${QUIZ_LABELS.q1[answers.q1]}`,
    `Biggest strength/curse: ${QUIZ_LABELS.q2[answers.q2]}`,
    `Right now feeling like: ${QUIZ_LABELS.q3[answers.q3]}`,
    `In a group, you are: ${QUIZ_LABELS.q4[answers.q4]}`,
    `What you actually want: ${QUIZ_LABELS.q5[answers.q5]}`,
    `When you care deeply, you: ${QUIZ_LABELS.q6[answers.q6]}`,
    `With authority, you: ${QUIZ_LABELS.q7[answers.q7]}`,
    `What you leave behind: ${QUIZ_LABELS.q8[answers.q8]}`,
  ].join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system:
      "You match people to anime characters through deep psychological insight. Your matches feel eerily accurate. You always find a primary match and a secondary match from a different show that reveals another facet of the same person. Respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: `Match this person to anime characters based on their psychological profile:

${formatted}

Output as JSON:
{
  "primary_character": "Character name",
  "primary_anime": "Anime title",
  "primary_percent": <60-80>,
  "secondary_character": "Different character name from a different show",
  "secondary_anime": "Different anime title",
  "secondary_percent": <must equal 100 minus primary_percent>,
  "archetype": "A memorable 3-5 word archetype like 'The Reluctant Protector' or 'The Quiet Strategist' or 'The Burning Heart'",
  "explanation": "4-5 sentences in second person. Don't just describe the character — explain WHY this person psychologically IS them. No spoilers.",
  "shadow_note": "One sentence starting with 'Under pressure, you become...' revealing their darker or hidden self"
}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as CharacterMatchResult;
}

// ── Quick Roast types ────────────────────────────────────────────────────────

export interface QuickAnimeEntry {
  title: string;
  rating?: number; // 1-10, optional
}

export interface QuickRoastResult {
  personality_type: string;
  roast_tier: string;
  taste_dna: TasteDNA;
  taste_sins: string[];
  redemption_arc: string[];
  roast_text: string;
}

// ── Quick Roast ──────────────────────────────────────────────────────────────

export async function generateQuickRoast(anime: QuickAnimeEntry[], hotTake?: string): Promise<QuickRoastResult> {
  const listText = anime
    .map((a) => a.rating != null ? `${a.title} (${a.rating}/10)` : a.title)
    .join(", ");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 900,
    system:
      "You are a brutally honest, witty anime critic who roasts people's taste. You are specific, funny, and loving underneath. You must respond with valid JSON only — no extra text.",
    messages: [
      {
        role: "user",
        content: `Analyze this person's anime picks and roast their taste:

Their anime list: ${listText}
${hotTake ? `Their hot take: "${hotTake}"` : ""}

Output as JSON:
{
  "personality_type": "Creative nickname for their anime personality (e.g. 'The Shonen Grinder', 'The Hidden Gem Archaeologist', 'The Emotional Masochist')",
  "roast_tier": "Funny tier label like 'Certified Mid-Tier Weeb' or 'Battle-Hardened Veteran' or 'Confused Normie'",
  "taste_dna": {
    "mainstream": <1-10 based on how mainstream their picks are>,
    "patience": <1-10 based on genre mix>,
    "darkness": <1-10 based on dark titles>,
    "emotional_depth": <1-10 based on emotional/heavy titles>,
    "completion_rate": <1-10 guess based on their picks>
  },
  "taste_sins": [
    "Specific funny callout #1 mentioning actual titles they listed",
    "Specific funny callout #2",
    "Specific funny callout #3"
  ],
  "redemption_arc": ["First anime they should watch next", "Second anime"],
  "roast_text": "2-3 sentences of brutally honest but loving roast. Be specific. Reference actual titles they listed. End with a tiny shred of hope."
}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as QuickRoastResult;
}

// ── Mood Finder ──────────────────────────────────────────────────────────────

export async function generateMoodRecommendations(moods: string[]): Promise<MoodResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system:
      "You are an anime sommelier. You recommend the perfect anime for any mood combination with confident, specific reasoning. You know what someone actually needs, not just what they asked for. Respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: `Someone wants to watch anime right now. Their mood: ${moods.join(" + ")}.

Give them 3 perfect anime recommendations. Be specific about WHY each fits this exact mood combination.

Output as JSON:
{
  "mood_label": "A creative, memorable name for this mood combination (e.g. 'The 2am Spiral Pack' or 'The Hype Injection Kit' or 'Sunday Morning Comfort Food')",
  "recommendations": [
    {
      "title": "Exact anime title",
      "why": "One specific sentence about why this is PERFECT for this exact mood combination — be specific about what scene or feeling delivers this",
      "episodes": "e.g. '12 eps' or '24 eps' or 'Ongoing' or 'Movie'",
      "hook": "2-4 extremely evocative words like 'Beautifully Devastating' or 'Pure Uncut Adrenaline' or 'Quietly Destroys You'",
      "genre": "Primary genre label"
    }
  ]
}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON in response");
  return JSON.parse(json) as MoodResult;
}

// ── Compatibility types ───────────────────────────────────────────────────────

export interface CompatibilityResult {
  score: number; // 0-100
  label: string; // e.g. "Anime Soulmates"
  summary: string;
  shared_favorites: string[];
  clashing_tastes: string[];
  watch_together: string[];
  why_youll_fight: string;
  fun_fact: string;
}

export async function generateCompatibility(
  userA: { username: string; top_genres: string[]; top_rated: string[]; mean_score: number },
  userB: { username: string; top_genres: string[]; top_rated: string[]; mean_score: number }
): Promise<CompatibilityResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: "You are a witty anime compatibility analyst. Be fun, specific, and honest. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Analyze the anime taste compatibility between two people:

${userA.username}: genres=${userA.top_genres.join(", ")}, top anime=${userA.top_rated.join(", ")}, mean score=${userA.mean_score}
${userB.username}: genres=${userB.top_genres.join(", ")}, top anime=${userB.top_rated.join(", ")}, mean score=${userB.mean_score}

Output as JSON:
{
  "score": <0-100 compatibility percentage>,
  "label": "Creative compatibility label e.g. 'Anime Soulmates', 'Respectful Rivals', 'Chaos Duo', 'Opposites Attract'",
  "summary": "2 sentences about their overall compatibility",
  "shared_favorites": ["Up to 3 anime genres or titles both would love"],
  "clashing_tastes": ["1-2 specific things they'd disagree on"],
  "watch_together": ["3 anime titles perfect for both of them to watch together"],
  "why_youll_fight": "One funny sentence about what they'd argue about",
  "fun_fact": "One surprising insight about their combined taste profile"
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as CompatibilityResult;
}

// ── Watch Order types ─────────────────────────────────────────────────────────

export interface WatchOrderResult {
  franchise: string;
  total_entries: number;
  difficulty: "Easy" | "Moderate" | "Complex";
  order: Array<{ num: number; title: string; type: string; episodes: string; note: string; essential: boolean }>;
  quick_start: string;
  skip_ok: string[];
  summary: string;
}

export async function generateWatchOrder(franchise: string): Promise<WatchOrderResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: "You are a definitive anime watch order guide. Give practical, opinionated guidance. No spoilers. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Give the definitive watch order for the "${franchise}" anime franchise.

Output as JSON:
{
  "franchise": "Official franchise name",
  "total_entries": <number of entries in your order>,
  "difficulty": "Easy" | "Moderate" | "Complex",
  "order": [
    { "num": 1, "title": "Exact title", "type": "TV/Movie/OVA/ONA", "episodes": "e.g. '24 eps' or 'Movie'", "note": "One sentence: why this entry, what it adds", "essential": true/false }
  ],
  "quick_start": "If someone wants to start with just ONE entry, which one and why (1 sentence)",
  "skip_ok": ["Titles that are safe to skip without missing plot"],
  "summary": "2 sentences on what makes this franchise worth watching"
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as WatchOrderResult;
}

// ── Should I Continue types ───────────────────────────────────────────────────

export interface ContinueResult {
  verdict: "KEEP GOING" | "SKIP TO" | "DROP IT";
  verdict_reason: string;
  it_gets_better: boolean;
  gets_better_at: string | null;
  skip_to_episode: number | null;
  skip_reason: string | null;
  honest_warning: string;
  similar_if_dropping: string[];
}

export async function generateShouldContinue(title: string, droppedAt: number): Promise<ContinueResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: "You are a brutally honest anime advisor. No spoilers but don't sugarcoat. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Someone dropped "${title}" at episode ${droppedAt}. Should they continue?

Output as JSON:
{
  "verdict": "KEEP GOING" | "SKIP TO" | "DROP IT",
  "verdict_reason": "1-2 sentences of honest reasoning",
  "it_gets_better": true/false,
  "gets_better_at": "Episode or arc description if it gets better, otherwise null",
  "skip_to_episode": <episode number to skip to, or null>,
  "skip_reason": "Why skipping to that episode works, or null",
  "honest_warning": "One honest warning about what they're getting into",
  "similar_if_dropping": ["2 better alternatives if verdict is DROP IT"]
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as ContinueResult;
}

// ── Debate types ──────────────────────────────────────────────────────────────

export interface DebateResult {
  opinion: string;
  verdict: "BASED" | "WRONG" | "COMPLICATED";
  verdict_reason: string;
  for_side: string[];
  against_side: string[];
  final_take: string;
  spicy_score: number; // 1-10
}

export async function generateDebate(opinion: string): Promise<DebateResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: "You are a confident anime debate judge. You argue both sides fairly but commit to a verdict. Be entertaining and specific. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Debate this anime opinion: "${opinion}"

Output as JSON:
{
  "opinion": "${opinion}",
  "verdict": "BASED" | "WRONG" | "COMPLICATED",
  "verdict_reason": "2 sentences of your final verdict with confidence",
  "for_side": ["3 strong arguments FOR this opinion"],
  "against_side": ["3 strong arguments AGAINST this opinion"],
  "final_take": "One definitive, opinionated closing statement",
  "spicy_score": <1-10, how controversial this opinion is>
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as DebateResult;
}

// ── Identity Card types ───────────────────────────────────────────────────────

export interface IdentityCardResult {
  title: string;
  tagline: string;
  watcher_class: string;
  episodes_badge: string;
  peak_anime: string;
  hidden_depth: string;
  taste_words: string[];
  era: string;
  loyalty_score: number; // 1-10
  rare_trait: string;
}

export async function generateIdentityCard(malSummary: {
  username: string;
  mean_score: number;
  completed: number;
  episodes_watched: number;
  top_genres: string[];
  top_rated: string[];
  most_watched_franchise: string;
}): Promise<IdentityCardResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: "You create beautiful, positive anime identity cards. Celebrate the watcher. Be specific and flattering — like a compliment wrapped in data. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Create an anime identity card for this watcher:

Username: ${malSummary.username}
Mean score: ${malSummary.mean_score}
Completed: ${malSummary.completed} anime
Episodes: ${malSummary.episodes_watched}
Top genres: ${malSummary.top_genres.join(", ")}
Highest rated: ${malSummary.top_rated.join(", ")}
Most watched franchise: ${malSummary.most_watched_franchise}

Output as JSON:
{
  "title": "Their watcher identity title e.g. 'The Emotional Architect' or 'The Quiet Completionist' or 'The Genre Nomad'",
  "tagline": "One evocative sentence that perfectly describes their anime soul",
  "watcher_class": "RPG-style class name e.g. 'Veteran Analyst', 'Emotional Glutton', 'Hidden Gem Ranger'",
  "episodes_badge": "Creative badge for their episode count e.g. '4,200 Episodes Deep', 'Basically a Full-Time Job'",
  "peak_anime": "The anime that probably defines them most, from their top rated",
  "hidden_depth": "One surprising positive insight about their taste",
  "taste_words": ["5 one-word descriptors of their taste e.g. 'Intense', 'Eclectic', 'Nostalgic'"],
  "era": "Their anime era e.g. 'Golden Age Veteran', 'Modern Wave Rider', 'Cross-Era Explorer'",
  "loyalty_score": <1-10, how loyal/dedicated a watcher they are>,
  "rare_trait": "One rare positive trait that makes them unique e.g. '97% completion rate puts you in the top 3% of watchers'"
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as IdentityCardResult;
}

// ── Seasonal Watchlist types ──────────────────────────────────────────────────

export interface SeasonalAnime {
  rank: number;
  title: string;
  verdict: "WATCH" | "SKIP" | "WAIT";
  hook: string;
  genres: string[];
  episodes: string;
  why_this_season: string;
  for_fans_of: string;
}

export interface SeasonalResult {
  season: string;
  year: number;
  generated_at: string;
  intro: string;
  picks: SeasonalAnime[];
}

export async function generateSeasonalWatchlist(season: string, year: number, animeList: string[]): Promise<SeasonalResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: "You are a seasonal anime guide. Give honest, useful verdicts for new watchers. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Generate verdicts for the ${season} ${year} anime season. Here are the airing shows: ${animeList.join(", ")}

Output as JSON:
{
  "season": "${season}",
  "year": ${year},
  "generated_at": "${new Date().toISOString()}",
  "intro": "2 sentences on what makes this season special or weak",
  "picks": [
    {
      "rank": 1,
      "title": "Exact title",
      "verdict": "WATCH" | "SKIP" | "WAIT",
      "hook": "3-5 evocative words",
      "genres": ["genre1", "genre2"],
      "episodes": "e.g. '12 eps' or 'Ongoing'",
      "why_this_season": "One sentence on why it stands out this season",
      "for_fans_of": "One sentence on who this is for"
    }
  ]
}

Include all shows, ranked by recommendation strength.`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as SeasonalResult;
}

// ── Tier List types ───────────────────────────────────────────────────────────

export interface TierEntry {
  title: string;
  tier: "S" | "A" | "B" | "C" | "D" | "F";
  reason: string;
}

export interface TierListResult {
  category: string;
  intro: string;
  tiers: TierEntry[];
  hot_take: string;
  most_controversial: string;
}

export async function generateTierList(category: string): Promise<TierListResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: "You are an opinionated anime tier list maker. Be bold, specific, and willing to be controversial. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Create an opinionated tier list for: "${category}"

Pick 12-16 relevant anime/characters/openings and assign them S/A/B/C/D/F tiers.

Output as JSON:
{
  "category": "${category}",
  "intro": "One punchy sentence about this tier list",
  "tiers": [
    { "title": "Name", "tier": "S"|"A"|"B"|"C"|"D"|"F", "reason": "One sentence justification" }
  ],
  "hot_take": "The most controversial placement and why you stand by it",
  "most_controversial": "The title most people will disagree with your ranking of"
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as TierListResult;
}

// ── Verse of the Day ──────────────────────────────────────────────────────────

export interface VerseOfDay {
  quote: string;
  character: string;
  anime: string;
  reflection: string;
}

export async function generateVerseOfDay(): Promise<VerseOfDay> {
  const today = new Date().toISOString().slice(0, 10);
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: "You pick memorable, meaningful anime quotes. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Pick one iconic anime quote for today (${today}). Choose something that's genuinely meaningful or thought-provoking, not just famous.

Output as JSON:
{ "quote": "exact quote", "character": "character name", "anime": "anime title", "reflection": "One sentence on why this quote matters" }`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as VerseOfDay;
}

// ── Year in Anime Wrapped ─────────────────────────────────────────────────────

export interface WrappedResult {
  year: number;
  username: string;
  headline: string;
  total_episodes: number;
  total_anime: number;
  top_genre: string;
  peak_anime: string;
  personality_evolution: string;
  defining_moment: string;
  stats_story: string;
  next_year_prediction: string;
  wrapped_title: string;
}

export async function generateWrapped(year: number, malSummary: {
  username: string;
  completed: number;
  episodes_watched: number;
  top_genres: string[];
  top_rated: string[];
  mean_score: number;
  most_watched_franchise: string;
}): Promise<WrappedResult> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: "You create beautiful Year in Anime summaries like Spotify Wrapped. Celebratory, personal, shareable. Respond with JSON only.",
    messages: [{
      role: "user",
      content: `Create a ${year} Year in Anime Wrapped for:

Username: ${malSummary.username}
Completed: ${malSummary.completed} anime
Episodes: ${malSummary.episodes_watched}
Top genres: ${malSummary.top_genres.join(", ")}
Top rated: ${malSummary.top_rated.join(", ")}
Mean score: ${malSummary.mean_score}
Most watched franchise: ${malSummary.most_watched_franchise}

Output as JSON:
{
  "year": ${year},
  "username": "${malSummary.username}",
  "headline": "Bold one-liner headline for their year e.g. 'The Year You Finally Got Into Seinen'",
  "total_episodes": ${malSummary.episodes_watched},
  "total_anime": ${malSummary.completed},
  "top_genre": "${malSummary.top_genres[0]}",
  "peak_anime": "Their defining anime of the year from top rated",
  "personality_evolution": "One sentence on how their taste evolved",
  "defining_moment": "A fictional but plausible defining moment e.g. 'The episode that made you cry at 2am'",
  "stats_story": "2 sentences telling the story of their year in anime",
  "next_year_prediction": "Playful prediction for next year's anime journey",
  "wrapped_title": "A creative title card for their year e.g. 'The Emotional Renaissance of ${malSummary.username}'"
}`,
    }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No text");
  const json = content.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("No JSON");
  return JSON.parse(json) as WrappedResult;
}
