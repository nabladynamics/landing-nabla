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
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata / Open Graph (defaults to `http://localhost:3000`). |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Optional override for the form's POST target (e.g. Formspree) instead of the built-in `/api/contact`. |

Copy `.env.example` to `.env.local` and fill in the values. Remember to add the server-side vars to your hosting provider (e.g. Vercel) on deploy.

## Private page-view counter

Triple-click the separator in `Barcelona · San Francisco` in the footer or Contact section to open the private counter. Keyboard users can focus the separator and press Enter. The password is checked on the server; it is never bundled in browser JavaScript. Closing the dialog clears its password and statistics.

The counter reports recorded **page views**, including repeat visits, from 23 September 2026 and for the current day in `Europe/London`. These are not unique people. Vercel Web Analytics only loads in production, so local development and preview deployments do not add traffic. Blocked analytics requests are not counted and results can take time to appear.

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
