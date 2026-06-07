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
