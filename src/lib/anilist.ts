const ANILIST_API = "https://graphql.anilist.co";

const QUERY = `
query ($username: String) {
  User(name: $username) {
    name
    statistics {
      anime {
        count
        meanScore
        minutesWatched
        genres(sort: COUNT_DESC, limit: 5) { genre count }
        statuses { count status }
      }
    }
  }
  MediaListCollection(userName: $username, type: ANIME) {
    lists {
      status
      entries {
        score(format: POINT_10)
        status
        media {
          title { romaji english }
          genres
        }
      }
    }
  }
}
`;

export async function getAniListSummary(username: string) {
  try {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    if (json.errors || !json.data?.User) return null;

    const user = json.data.User;
    const stats = user.statistics.anime;

    // Flatten all list entries
    const entries: Array<{ score: number; status: string; title: string; genres: string[] }> = [];
    for (const list of json.data.MediaListCollection?.lists ?? []) {
      for (const e of list.entries ?? []) {
        entries.push({
          score: e.score ?? 0,
          status: e.status ?? "",
          title: e.media?.title?.english || e.media?.title?.romaji || "",
          genres: e.media?.genres ?? [],
        });
      }
    }

    const completed = entries.filter(e => e.status === "COMPLETED").length;
    const dropped = entries.filter(e => e.status === "DROPPED").length;
    const scored = entries.filter(e => e.score > 0);
    const sorted = [...scored].sort((a, b) => b.score - a.score);

    const topGenres = (stats.genres ?? []).map((g: { genre: string }) => g.genre).slice(0, 5);

    const titleCount: Record<string, number> = {};
    entries.forEach(e => {
      const base = e.title.split(":")[0].trim();
      titleCount[base] = (titleCount[base] ?? 0) + 1;
    });
    const mostWatched = Object.entries(titleCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";

    return {
      username: user.name,
      mean_score: (stats.meanScore ?? 0) / 10, // AniList is /100, normalize to /10
      completed,
      dropped,
      episodes_watched: Math.round((stats.minutesWatched ?? 0) / 24), // rough episode estimate
      top_genres: topGenres,
      top_rated: sorted.slice(0, 3).map(e => `${e.title} (${e.score})`),
      worst_rated: sorted.slice(-3).map(e => `${e.title} (${e.score})`),
      most_watched_franchise: mostWatched,
      source: "anilist" as const,
    };
  } catch {
    return null;
  }
}
