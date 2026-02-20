import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/docs", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/api-docs", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/scoring", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/alerts", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/security", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
