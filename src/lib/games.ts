// Shared game utilities — leaderboards, scoring, anime pool

import { cacheGet, cacheSet } from "./redis";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type GameId = "duel" | "cipher" | "guesser";

export interface GameScore {
  id?: string;
  game: GameId;
  session_id: string;
  score: number;
  accuracy?: number;       // 0-100
  time_seconds?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  session_id: string;
  score: number;
  accuracy?: number;
  time_seconds?: number;
  created_at: string;
}

// ── Score submission ──────────────────────────────────────────────────────────

export async function submitScore(score: Omit<GameScore, "id" | "created_at">): Promise<GameScore | null> {
  const { data } = await supabase()
    .from("game_scores")
    .insert(score)
    .select()
    .single();
  return data;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(game: GameId, limit = 10): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard:${game}:${limit}`;
  const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
  if (cached) return cached;

  const { data } = await supabase()
    .from("game_scores")
    .select("session_id, score, accuracy, time_seconds, created_at")
    .eq("game", game)
    .order("score", { ascending: false })
    .limit(limit);

  const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => ({
    rank: i + 1,
    session_id: row.session_id,
    score: row.score,
    accuracy: row.accuracy,
    time_seconds: row.time_seconds,
    created_at: row.created_at,
  }));

  await cacheSet(cacheKey, entries, 60); // 60s cache
  return entries;
}

export async function getPlayerRank(game: GameId, score: number): Promise<{ rank: number; total: number; percentile: number }> {
  const { count: total } = await supabase()
    .from("game_scores")
    .select("*", { count: "exact", head: true })
    .eq("game", game);

  const { count: below } = await supabase()
    .from("game_scores")
    .select("*", { count: "exact", head: true })
    .eq("game", game)
    .lt("score", score);

  const t = total ?? 1;
  const b = below ?? 0;
  const rank = t - b;
  const percentile = Math.round((b / t) * 100);

  return { rank, total: t, percentile };
}

// ── Anime pool for games ──────────────────────────────────────────────────────

export interface DuelAnime {
  mal_id: number;
  title: string;
  score: number;
  members: number;
  episodes: number;
  image_url: string;
  genres: string[];
  synopsis?: string;
}

// Curated pool of well-known anime for fair duel matchups
export const DUEL_POOL: DuelAnime[] = [
  { mal_id: 16498, title: "Attack on Titan", score: 9.0, members: 3800000, episodes: 25, image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", genres: ["Action", "Drama"] },
  { mal_id: 38000, title: "Demon Slayer", score: 8.7, members: 3500000, episodes: 26, image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", genres: ["Action", "Fantasy"] },
  { mal_id: 1535, title: "Death Note", score: 8.6, members: 3700000, episodes: 37, image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", genres: ["Psychological", "Thriller"] },
  { mal_id: 11061, title: "Hunter x Hunter (2011)", score: 9.0, members: 2800000, episodes: 148, image_url: "https://cdn.myanimelist.net/images/anime/11/33657.jpg", genres: ["Action", "Adventure"] },
  { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", score: 9.1, members: 3000000, episodes: 64, image_url: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", genres: ["Action", "Adventure"] },
  { mal_id: 40748, title: "Jujutsu Kaisen", score: 8.6, members: 2700000, episodes: 24, image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", genres: ["Action", "Fantasy"] },
  { mal_id: 20, title: "Naruto", score: 8.0, members: 3300000, episodes: 220, image_url: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", genres: ["Action", "Adventure"] },
  { mal_id: 21, title: "One Piece", score: 8.7, members: 2500000, episodes: 1000, image_url: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", genres: ["Action", "Adventure"] },
  { mal_id: 269, title: "Bleach", score: 7.9, members: 2300000, episodes: 366, image_url: "https://cdn.myanimelist.net/images/anime/3/40451.jpg", genres: ["Action", "Adventure"] },
  { mal_id: 918, title: "Gintama", score: 9.0, members: 1500000, episodes: 201, image_url: "https://cdn.myanimelist.net/images/anime/5/8443.jpg", genres: ["Comedy", "Sci-Fi"] },
  { mal_id: 33486, title: "Sword Art Online: Alicization", score: 8.0, members: 1500000, episodes: 24, image_url: "https://cdn.myanimelist.net/images/anime/1880/114935.jpg", genres: ["Action", "Fantasy"] },
  { mal_id: 1, title: "Cowboy Bebop", score: 8.8, members: 1800000, episodes: 26, image_url: "https://cdn.myanimelist.net/images/anime/4/19644.jpg", genres: ["Action", "Sci-Fi"] },
  { mal_id: 30276, title: "One Punch Man", score: 8.7, members: 2800000, episodes: 12, image_url: "https://cdn.myanimelist.net/images/anime/12/76049.jpg", genres: ["Action", "Comedy"] },
  { mal_id: 199, title: "Sen to Chihiro", score: 8.9, members: 1800000, episodes: 1, image_url: "https://cdn.myanimelist.net/images/anime/6/79597.jpg", genres: ["Adventure", "Fantasy"] },
  { mal_id: 37999, title: "Kimetsu no Yaiba: Mugen Ressha-hen", score: 8.3, members: 2000000, episodes: 7, image_url: "https://cdn.myanimelist.net/images/anime/1704/106947.jpg", genres: ["Action", "Fantasy"] },
  { mal_id: 44511, title: "Spy x Family", score: 8.5, members: 1700000, episodes: 25, image_url: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg", genres: ["Action", "Comedy"] },
  { mal_id: 52991, title: "Sousou no Frieren", score: 9.1, members: 1200000, episodes: 28, image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg", genres: ["Adventure", "Fantasy"] },
  { mal_id: 25013, title: "Shingeki no Kyojin Season 2", score: 8.5, members: 2000000, episodes: 12, image_url: "https://cdn.myanimelist.net/images/anime/4/84177.jpg", genres: ["Action", "Drama"] },
  { mal_id: 2904, title: "Code Geass: Hangyaku no Lelouch R2", score: 9.0, members: 1700000, episodes: 25, image_url: "https://cdn.myanimelist.net/images/anime/8/9680.jpg", genres: ["Action", "Sci-Fi"] },
  { mal_id: 1575, title: "Code Geass: Hangyaku no Lelouch", score: 8.7, members: 2100000, episodes: 25, image_url: "https://cdn.myanimelist.net/images/anime/5/50331.jpg", genres: ["Action", "Sci-Fi"] },
  { mal_id: 19, title: "Monster", score: 8.7, members: 1000000, episodes: 74, image_url: "https://cdn.myanimelist.net/images/anime/10/18793.jpg", genres: ["Drama", "Mystery"] },
  { mal_id: 3297, title: "Honey and Clover II", score: 8.3, members: 120000, episodes: 12, image_url: "https://cdn.myanimelist.net/images/anime/10/19858.jpg", genres: ["Drama", "Romance"] },
  { mal_id: 32281, title: "Kimi no Na wa.", score: 9.0, members: 2300000, episodes: 1, image_url: "https://cdn.myanimelist.net/images/anime/5/87048.jpg", genres: ["Drama", "Romance"] },
  { mal_id: 28977, title: "Gintama°", score: 9.1, members: 700000, episodes: 51, image_url: "https://cdn.myanimelist.net/images/anime/3/72078.jpg", genres: ["Comedy", "Sci-Fi"] },
  { mal_id: 9253, title: "Steins;Gate", score: 9.1, members: 2000000, episodes: 24, image_url: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", genres: ["Sci-Fi", "Thriller"] },
  { mal_id: 15417, title: "Shigatsu wa Kimi no Uso", score: 8.7, members: 1700000, episodes: 22, image_url: "https://cdn.myanimelist.net/images/anime/3/67177.jpg", genres: ["Drama", "Music", "Romance"] },
  { mal_id: 1462, title: "Neon Genesis Evangelion", score: 8.4, members: 1500000, episodes: 26, image_url: "https://cdn.myanimelist.net/images/anime/10/18793.jpg", genres: ["Drama", "Sci-Fi"] },
  { mal_id: 6547, title: "Angel Beats!", score: 8.2, members: 1600000, episodes: 13, image_url: "https://cdn.myanimelist.net/images/anime/13/22128.jpg", genres: ["Action", "Drama"] },
  { mal_id: 22319, title: "Tokyo Ghoul", score: 8.0, members: 2200000, episodes: 12, image_url: "https://cdn.myanimelist.net/images/anime/5/64449.jpg", genres: ["Action", "Horror"] },
  { mal_id: 39535, title: "Vinland Saga", score: 8.8, members: 1000000, episodes: 24, image_url: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg", genres: ["Action", "Adventure"] },
];

export function getRandomPair(): [DuelAnime, DuelAnime] {
  const pool = [...DUEL_POOL];
  const i = Math.floor(Math.random() * pool.length);
  let j = Math.floor(Math.random() * (pool.length - 1));
  if (j >= i) j++;
  return [pool[i], pool[j]];
}

// ── Synopsis pool for Cipher ──────────────────────────────────────────────────

export interface CipherAnime {
  mal_id: number;
  title: string;
  synopsis: string;
  genres: string[];
  score: number;
}

export const CIPHER_POOL: CipherAnime[] = [
  {
    mal_id: 16498, title: "Attack on Titan",
    synopsis: "Humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid beings who devour humans seemingly without reason. A young boy swears to exterminate all Titans after one breaks through the walls and kills his mother.",
    genres: ["Action", "Drama"], score: 9.0,
  },
  {
    mal_id: 1535, title: "Death Note",
    synopsis: "A high school student discovers a supernatural notebook that allows him to kill anyone whose name he writes in it. He decides to use it to rid the world of criminals, but a brilliant detective starts to hunt him down.",
    genres: ["Psychological", "Thriller"], score: 8.6,
  },
  {
    mal_id: 9253, title: "Steins;Gate",
    synopsis: "A self-proclaimed mad scientist accidentally discovers a way to send messages to the past using a microwave. As he tampers with the timeline, he becomes entangled in a dangerous conspiracy that puts his friends at risk.",
    genres: ["Sci-Fi", "Thriller"], score: 9.1,
  },
  {
    mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood",
    synopsis: "Two brothers use alchemy to try to bring their dead mother back to life, paying a terrible price. They join the military to search for the Philosopher's Stone to restore their broken bodies and uncover a massive conspiracy.",
    genres: ["Action", "Adventure"], score: 9.1,
  },
  {
    mal_id: 32281, title: "Kimi no Na wa.",
    synopsis: "A high school boy in Tokyo and a girl in a rural town mysteriously swap bodies on random days. When the swaps suddenly stop, the boy tries desperately to find her, only to discover a devastating truth about time.",
    genres: ["Drama", "Romance"], score: 9.0,
  },
  {
    mal_id: 30276, title: "One Punch Man",
    synopsis: "A superhero who trained so hard he can defeat any enemy with a single punch faces an unexpected crisis: he's become so powerful that battles no longer excite him. He searches for a worthy opponent while nobody takes him seriously.",
    genres: ["Action", "Comedy"], score: 8.7,
  },
  {
    mal_id: 11061, title: "Hunter x Hunter (2011)",
    synopsis: "A young boy discovers his missing father is actually a famous hunter and sets out on a journey to find him. He must pass a brutal exam and forge unlikely friendships to survive a world where power determines everything.",
    genres: ["Action", "Adventure"], score: 9.0,
  },
  {
    mal_id: 39535, title: "Vinland Saga",
    synopsis: "A young Viking warrior seeks revenge against the man who killed his father — a legendary mercenary. His journey through war and slavery forces him to question whether a warrior's life is truly worth living.",
    genres: ["Action", "Adventure"], score: 8.8,
  },
  {
    mal_id: 15417, title: "Your Lie in April",
    synopsis: "A piano prodigy who stopped playing after his mother's death meets a violinist who performs freely and passionately. She reignites his love for music, but she hides a heartbreaking secret from him.",
    genres: ["Drama", "Music", "Romance"], score: 8.7,
  },
  {
    mal_id: 22319, title: "Tokyo Ghoul",
    synopsis: "A college student becomes half-ghoul after a near-fatal date and must now eat human flesh to survive while trying to maintain his humanity. He is caught between two worlds where he truly belongs to neither.",
    genres: ["Action", "Horror"], score: 8.0,
  },
  {
    mal_id: 44511, title: "Spy x Family",
    synopsis: "A spy, an assassin, and a telepath are forced to form a fake family for a mission. The irony is that none of them can reveal their true identities — but their bond becomes unexpectedly real.",
    genres: ["Action", "Comedy"], score: 8.5,
  },
  {
    mal_id: 52991, title: "Frieren: Beyond Journey's End",
    synopsis: "An elven mage who helped defeat the demon king returns to the world decades later after her companions have aged and died. She begins to understand humanity by retracing the journey that now exists only in her memories.",
    genres: ["Adventure", "Fantasy"], score: 9.1,
  },
  {
    mal_id: 38000, title: "Demon Slayer",
    synopsis: "A kind boy finds his family slaughtered by demons and his sister turned into one. He joins an ancient organization of demon hunters to find a cure for his sister and avenge his family.",
    genres: ["Action", "Fantasy"], score: 8.7,
  },
  {
    mal_id: 6547, title: "Angel Beats!",
    synopsis: "A teenager wakes up in the afterlife at a high school where students with regrets rebel against God. He joins a student guerrilla organization to fight for their right to exist before they're erased from the world.",
    genres: ["Action", "Drama"], score: 8.2,
  },
  {
    mal_id: 19, title: "Monster",
    synopsis: "A brilliant doctor saves the life of a boy who grows up to become a serial killer. Haunted by guilt and hunted by the police himself, the doctor pursues the killer across Europe to stop his creation.",
    genres: ["Drama", "Mystery"], score: 8.7,
  },
  {
    mal_id: 2904, title: "Code Geass: R2",
    synopsis: "A genius tactician who can command anyone to obey him leads a rebellion against a world superpower, wearing a mask to protect his identity. Every victory costs him something precious and he must decide how far he's willing to go.",
    genres: ["Action", "Sci-Fi"], score: 9.0,
  },
  {
    mal_id: 40748, title: "Jujutsu Kaisen",
    synopsis: "A high school student with inhuman strength swallows a cursed finger to save his classmates and becomes the host of the most powerful curse in existence. He must consume all 20 fingers before he is executed.",
    genres: ["Action", "Fantasy"], score: 8.6,
  },
  {
    mal_id: 1, title: "Cowboy Bebop",
    synopsis: "A ragtag crew of bounty hunters cruise the solar system in a ship that's falling apart. Each crew member carries a dark past they're running from, and the bounties never quite cover the cost of catching them.",
    genres: ["Action", "Sci-Fi"], score: 8.8,
  },
  {
    mal_id: 1462, title: "Neon Genesis Evangelion",
    synopsis: "A reluctant teenager is forced to pilot a giant mech to fight mysterious beings threatening humanity. As victories mount, the psychological toll on him and the other young pilots pushes them all to the edge.",
    genres: ["Drama", "Sci-Fi"], score: 8.4,
  },
  {
    mal_id: 20, title: "Naruto",
    synopsis: "An orphaned boy born with a dangerous spirit sealed inside him grows up shunned by his village. His relentless determination to become the strongest leader and prove his worth to everyone drives the entire story.",
    genres: ["Action", "Adventure"], score: 8.0,
  },
];
