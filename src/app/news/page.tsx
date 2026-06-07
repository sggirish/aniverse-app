"use client";
import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  url: string;
  image_url?: string;
  published: string;
  source: string;
  category: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => { setArticles(d.articles ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];
  const filtered = filter === "All" ? articles : articles.filter((a) => a.category === filter);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#10B981]">📰</span> Anime News
          </h1>
          <p className="text-gray-400">Latest from the anime world — aggregated from top sources</p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading latest news...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === c
                      ? "bg-[#10B981] border-[#10B981] text-black font-semibold"
                      : "bg-[#12121a] border-[#2a2a3a] text-gray-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-500">No articles found</div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#12121a] border border-[#2a2a3a] hover:border-[#10B981]/50 rounded-xl overflow-hidden transition-colors group"
                >
                  {article.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full">{article.category}</span>
                      <span className="text-xs text-gray-500">{article.source}</span>
                      <span className="text-xs text-gray-600 ml-auto">{timeAgo(article.published)}</span>
                    </div>
                    <h2 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#10B981] transition-colors">
                      {article.title}
                    </h2>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
