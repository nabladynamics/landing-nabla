# Nabla AI — Landing

Marketing site for Nabla AI: a physics-first, adaptive CFD engine in development.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (lazy-loaded features, respects `prefers-reduced-motion`)
- Lucide icons

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Configuration

| Env var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Server-side Resend key used by [app/api/contact/route.ts](app/api/contact/route.ts) to deliver contact-form email. |
| `CONTACT_TO_EMAIL` | Recipient inbox for contact-form submissions. |
| `CONTACT_FROM_EMAIL` | Optional sender identity; requires a domain verified in Resend (defaults to `onboarding@resend.dev`). |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and social previews (defaults to `https://www.nabla.world`). Do not set this to localhost or a Vercel preview URL. |
| `GOOGLE_SITE_VERIFICATION` | Optional additional Search Console HTML-tag verification token (the `content` value only). The primary owner's public marker is already included in `lib/seo.ts`; keep it to retain verification. |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Optional override for the form's POST target (e.g. Formspree) instead of the built-in `/api/contact`. |

Copy `.env.example` to `.env.local` and fill in the values. Remember to add the server-side vars to your hosting provider (e.g. Vercel) on deploy.

## Search visibility

Public pages have unique titles, descriptions, canonical URLs and social metadata. Home includes `WebSite` and `Organization` structured data linking Nabla AI, Nabla and Nabla World to the public domain. `/sitemap.xml` lists Home, Industries and Contact; `/robots.txt` advertises it. Vercel preview builds use `noindex, nofollow` and disallow crawling. Production remains indexable.

The owner's `https://www.nabla.world/` Search Console URL-prefix property uses the public HTML verification marker in `lib/seo.ts`. It is not a secret. Keep the marker in the rendered HTML so verification persists; no GoDaddy access or DNS changes are needed for this method. Historical `NEXT_PUBLIC_SITE_URL` values using `nabla.world` normalize to the deployed `https://www.nabla.world` origin.

After deploying these changes:

1. Check that `https://www.nabla.world/sitemap.xml` returns XML with the three public URLs and that each page has its own canonical URL. The apex domain should continue redirecting to `www`.
2. Open [Google Search Console](https://search.google.com/search-console). Add or select the `nabla.world` Domain property and verify the TXT record with the DNS provider. Alternatively, add the `https://www.nabla.world/` URL-prefix property, set `GOOGLE_SITE_VERIFICATION` in Vercel Production to Google's HTML-tag token, redeploy, then verify.
3. Submit `https://www.nabla.world/sitemap.xml` under **Sitemaps**.
4. Inspect the home URL, use **Test live URL**, and request indexing. Inspect Industries and Contact if necessary. Check the Page indexing report for Google's actual exclusion reasons; search results alone do not diagnose them.
5. Keep the website linked from the company LinkedIn profile and other relevant public profiles. Publish useful technical material and validated case studies as they become available, preserving the distinction between development goals and measured results.

Google controls crawling and ranking. Indexing can take days or weeks, and a sitemap or indexing request does not guarantee inclusion or a position for competitive queries such as “CFD simulation”. See [Google's indexing guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Private page-view counter

Triple-click the separator in `Barcelona · San Francisco` in the footer or Contact section to open the private counter. Keyboard users can focus the separator and press Enter. The password is checked on the server; it is never bundled in browser JavaScript. The unlocked dialog keeps its password only in memory to authenticate report changes. Closing it clears the password and statistics.

The counter reports recorded **page views**, including repeat visits, from 23 September 2026 and for the current day in `Europe/London`. These are not unique people. Vercel Web Analytics only loads in production, so local development and preview deployments do not add traffic. Blocked analytics requests are not counted and results can take time to appear.

The expanded report includes date filters, a daily chart (or hourly chart for one selected day), exact bucket counts, countries and CSV export. Report dates and chart buckets use UTC; the Today summary uses Europe/London. Detailed queries are restricted to the last 30 calendar days and never predate activation. The all-time count remains independent of that reporting window. Unknown locations and Vercel’s Others group are retained.

Production setup in the **Nabla** Vercel project:

1. Enable **Analytics → Web Analytics**.
2. Add the following environment variables for **Production**, keeping both secrets server-side:
   - `VISITOR_STATS_PASSWORD`: the agreed private counter password.
   - `VISITOR_STATS_VERCEL_TOKEN`: a Vercel API token authorized to read this project's analytics. Use the narrowest available scope for Nabla.
   - `VISITOR_STATS_PROJECT_ID`: the project's `prj_…` ID from Settings → General.
   - `VISITOR_STATS_TEAM_SLUG`: `nabla-ai-s-projects` (or use `VISITOR_STATS_TEAM_ID` instead).
3. Redeploy after saving the environment variables, then open the counter on `https://www.nabla.world` to verify it.

No token or password belongs in Git or a `NEXT_PUBLIC_` variable. Missing configuration and upstream errors show an unavailable state, never an invented zero. Statistics are fetched through the authenticated, non-cacheable `/api/visits` endpoint. Its per-instance login throttle is supplementary; Vercel Firewall should enforce a shared rate limit on that endpoint if stronger brute-force protection is needed.

References: [Web Analytics setup](https://vercel.com/docs/analytics/quickstart), [Analytics API](https://vercel.com/docs/analytics/web-analytics-api).

## Notes

- Spatial is the sole design, with Home (`/`), Industries (`/industries`) and Let’s Talk (`/contact`) in the navigation. There is no style selector, theme provider or saved style preference.
- Former `/styles/{default|deeptech|editorial|industrial|lab|spatial}` URLs, including their `/industries` and `/contact` paths, redirect to the corresponding canonical pages while preserving unrelated query parameters and fragments. The obsolete `theme` parameter is removed. Platform remains deferred; `/platform` temporarily redirects home.
- Home opens with an interactive 3D journey, followed by the conventional CFD workflow and the approach Nabla is developing. The animated scenes are illustrative, not simulation results. See [the experience documentation](app/experience/README.md) for rendering, accessibility and asset details.
- Industries uses the six supplied industry photographs. A compact, single-row logo strip presents the founders’ institutional experience near the end of Home; on narrow screens it scrolls horizontally.
- Contact-form delivery is configured through the environment variables above. Product benefits are presented as development goals.
