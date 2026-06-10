import type { MetadataRoute } from "next";

import { appConfig } from "@/lib/constants/domain";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout", "/orders", "/supplier-dashboard", "/revenue", "/login", "/register"]
      }
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl
  };
}
