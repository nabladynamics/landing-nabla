import type { MetadataRoute } from "next";
import { absoluteUrl, publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only index real public pages, excluding redirects, APIs and preview URLs.
  // Omit lastModified until actual content modification dates are available.
  return Object.values(publicPages).map(({ path }) => ({ url: absoluteUrl(path) }));
}
