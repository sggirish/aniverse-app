import { MetadataRoute } from "next";
import { getAllVerdictSlugs } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://anideck.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                          lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/roast`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/watch`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/character`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/mood`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/games`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/duel`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/cipher`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/guesser`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/compatibility`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/watchorder`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/continue`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/debate`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/identity`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/season`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/tier`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/wrapped`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/news`,                lastModified: new Date(), changeFrequency: "hourly",  priority: 0.8 },
    { url: `${base}/pro`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/api-docs`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  let verdictRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllVerdictSlugs();
    verdictRoutes = slugs.map((slug) => ({
      url: `${base}/watch/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch { /* DB not ready */ }

  return [...staticRoutes, ...verdictRoutes];
}
