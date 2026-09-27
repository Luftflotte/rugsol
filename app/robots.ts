import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Twitterbot",
        allow: ["/", "/api/og"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: ["/", "/api/og"],
      },
      {
        userAgent: "LinkedInBot",
        allow: ["/", "/api/og"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
