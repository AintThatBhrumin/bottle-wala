import type { MetadataRoute } from "next";

import { appConfig } from "@/lib/constants/domain";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: appConfig.siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
