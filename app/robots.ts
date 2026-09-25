import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isPreview
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
