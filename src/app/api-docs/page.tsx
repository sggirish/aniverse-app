const BASE = "https://anideck.app";

const endpoints = [
  {
    method: "POST",
    path: "/api/roast",
    desc: "Roast a MAL or AniList profile",
    params: [
      { name: "username", type: "string", required: true, desc: "MAL or AniList username" },
      { name: "platform", type: '"mal" | "anilist"', required: false, desc: "Default: mal" },
    ],
    example: `curl -X POST ${BASE}/api/roast \\
  -H "Content-Type: application/json" \\
  -d '{"username":"YourMALUser","platform":"mal"}'`,
  },
  {
    method: "POST",
    path: "/api/roast/quick",
    desc: "Roast a custom list without account",
    params: [
      { name: "anime", type: "Array<{title, rating}>", required: true, desc: "3–10 anime with ratings 1–10" },
      { name: "hot_take", type: "string", required: false, desc: "Optional controversial opinion" },
    ],
    example: `curl -X POST ${BASE}/api/roast/quick \\
  -H "Content-Type: application/json" \\
  -d '{"anime":[{"title":"Naruto","rating":9},{"title":"SAO","rating":4}]}'`,
  },
  {
    method: "GET",
    path: "/api/watch?title=:title",
    desc: "Get AI verdict for an anime",
    params: [
      { name: "title", type: "string", required: true, desc: "Anime title to evaluate" },
    ],
    example: `curl "${BASE}/api/watch?title=Fullmetal+Alchemist+Brotherhood"`,
  },
  {
    method: "POST",
    path: "/api/compatibility",
    desc: "Compare anime taste between two users",
    params: [
      { name: "userA", type: "{username, platform}", required: true, desc: "First user" },
      { name: "userB", type: "{username, platform}", required: true, desc: "Second user" },
    ],
    example: `curl -X POST ${BASE}/api/compatibility \\
  -H "Content-Type: application/json" \\
  -d '{"userA":{"username":"Alice","platform":"mal"},"userB":{"username":"Bob","platform":"mal"}}'`,
  },
  {
    method: "POST",
    path: "/api/watchorder",
    desc: "Get watch order guide for an anime franchise",
    params: [
      { name: "franchise", type: "string", required: true, desc: "Franchise name (e.g. Fate, Monogatari)" },
    ],
    example: `curl -X POST ${BASE}/api/watchorder \\
  -H "Content-Type: application/json" \\
  -d '{"franchise":"Monogatari"}'`,
  },
  {
    method: "POST",
    path: "/api/continue",
    desc: "Should you continue a dropped anime?",
    params: [
      { name: "title", type: "string", required: true, desc: "Anime title" },
      { name: "dropped_at", type: "string", required: false, desc: "Where you dropped it" },
    ],
    example: `curl -X POST ${BASE}/api/continue \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Bleach","dropped_at":"Bount arc"}'`,
  },
  {
    method: "POST",
    path: "/api/debate",
    desc: "Debate any anime hot take",
    params: [
      { name: "opinion", type: "string", required: true, desc: "Max 200 chars" },
    ],
    example: `curl -X POST ${BASE}/api/debate \\
  -H "Content-Type: application/json" \\
  -d '{"opinion":"SAO is actually good"}'`,
  },
  {
    method: "GET",
    path: "/api/verse",
    desc: "Daily anime quote",
    params: [],
    example: `curl "${BASE}/api/verse"`,
  },
  {
    method: "GET",
    path: "/api/season",
    desc: "Seasonal anime watchlist",
    params: [
      { name: "season", type: "string", required: false, desc: "Winter/Spring/Summer/Fall" },
      { name: "year", type: "number", required: false, desc: "Year (default: current)" },
    ],
    example: `curl "${BASE}/api/season?season=Fall&year=2025"`,
  },
  {
    method: "POST",
    path: "/api/tier",
    desc: "Generate an anime tier list",
    params: [
      { name: "category", type: "string", required: true, desc: "What to tier (e.g. Shonen anime)" },
    ],
    example: `curl -X POST ${BASE}/api/tier \\
  -H "Content-Type: application/json" \\
  -d '{"category":"Isekai anime"}'`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-400 bg-green-900/20 border-green-500/30",
  POST: "text-blue-400 bg-blue-900/20 border-blue-500/30",
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#3B82F6]">🔌</span> AniVerse API
          </h1>
          <p className="text-gray-400">
            Free REST API. No auth required. Fair use limits apply.
          </p>
          <div className="mt-4 inline-block bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2">
            <code className="text-[#3B82F6] text-sm">{BASE}</code>
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 mb-8">
          <h2 className="font-semibold text-white mb-3">Rate Limits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Roast", "5/day"],
              ["Watch", "50/day"],
              ["Debate", "15/day"],
              ["Tier List", "10/day"],
            ].map(([label, limit]) => (
              <div key={label} className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                <div className="text-white font-semibold text-sm">{limit}</div>
                <div className="text-gray-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-3">Limits are per IP per day. Cached results don&apos;t count toward limits.</p>
        </div>

        <div className="space-y-6">
          {endpoints.map((ep) => (
            <div key={ep.path} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${METHOD_COLORS[ep.method] ?? ""}`}>
                    {ep.method}
                  </span>
                  <code className="text-white font-mono text-sm">{ep.path}</code>
                </div>
                <p className="text-gray-400 text-sm">{ep.desc}</p>
              </div>

              {ep.params.length > 0 && (
                <div className="p-5 border-b border-[#2a2a3a]">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Parameters</h3>
                  <div className="space-y-2">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-3 text-sm">
                        <code className="text-[#3B82F6] font-mono flex-shrink-0">{p.name}</code>
                        <code className="text-gray-500 text-xs flex-shrink-0">{p.type}</code>
                        {p.required ? (
                          <span className="text-xs text-red-400 flex-shrink-0">required</span>
                        ) : (
                          <span className="text-xs text-gray-600 flex-shrink-0">optional</span>
                        )}
                        <span className="text-gray-400 text-xs">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Example</h3>
                <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                  <code>{ep.example}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 text-center">
          <h2 className="font-bold text-white mb-2">Building something cool?</h2>
          <p className="text-gray-400 text-sm">
            Tag us on social or open a GitHub issue — we&apos;d love to see what you build.
          </p>
        </div>
      </div>
    </main>
  );
}
