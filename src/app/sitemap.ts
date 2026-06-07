import { MetadataRoute } from "next";
import { getAllVerdictSlugs } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://aniverse.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/roast`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/watch`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/character`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
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
