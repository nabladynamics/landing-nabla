import type { Metadata } from "next";
import { site } from "@/lib/site";

// Keep canonical URLs on the public domain, including during local builds.
// Never derive these from a request host or a Vercel preview deployment URL.
const configuredSiteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.nabla.world",
);
// The deployed apex domain redirects to www. Normalize older environment values
// so every canonical, sitemap entry and structured-data URL uses the final host.
export const siteUrl = ["nabla.world", "www.nabla.world"].includes(configuredSiteUrl.hostname)
  ? "https://www.nabla.world"
  : configuredSiteUrl.origin;

export const isPreview = process.env.VERCEL_ENV === "preview";

// Public HTML verification token for the site's owner's Search Console account.
// Google requires this marker to remain published after ownership verification.
export const googleSiteVerification = "5myAfHWN5Zh5BMEmco5D6AQDiKzgzAsYT-fY1VRJJ24";

export const publicPages = {
  home: {
    path: "/",
    title: "Nabla AI | Physics-first CFD Simulation",
    description: site.description,
  },
  industries: {
    path: "/industries",
    title: "CFD Simulation for Engineering Industries | Nabla AI",
    description:
      "Explore CFD simulation challenges in aviation, space, marine, rail, wind energy and turbomachinery that guide Nabla AI's engine development.",
  },
  contact: {
    path: "/contact",
    title: "Contact Nabla AI | CFD Simulation and Partnerships",
    description:
      "Talk to Nabla AI about CFD simulation workloads, early access, benchmark cases, research collaborations and engineering partnerships.",
  },
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata(page: keyof typeof publicPages): Metadata {
  const { path, title, description } = publicPages[page];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      locale: "en_US",
      url: absoluteUrl(path),
      images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: site.name,
      alternateName: site.alternateNames,
      url: absoluteUrl("/"),
      description: site.description,
      sameAs: [site.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: site.name,
      alternateName: site.alternateNames,
      url: absoluteUrl("/"),
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": absoluteUrl("/#organization") },
    },
  ],
};
