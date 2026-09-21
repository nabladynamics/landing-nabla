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

## Notes

- Spatial is the sole design, with Home (`/`), Industries (`/industries`) and Let’s Talk (`/contact`) in the navigation. There is no style selector, theme provider or saved style preference.
- Former `/styles/{default|deeptech|editorial|industrial|lab|spatial}` URLs, including their `/industries` and `/contact` paths, redirect to the corresponding canonical pages while preserving unrelated query parameters and fragments. The obsolete `theme` parameter is removed. Platform remains deferred; `/platform` temporarily redirects home.
- Home opens with an interactive 3D journey, followed by the conventional CFD workflow and the approach Nabla is developing. The animated scenes are illustrative, not simulation results. See [the experience documentation](app/experience/README.md) for rendering, accessibility and asset details.
- Industries uses the six supplied industry photographs. A compact, single-row logo strip presents the founders’ institutional experience near the end of Home; on narrow screens it scrolls horizontally.
- Contact-form delivery is configured through the environment variables above. Product benefits are presented as development goals.
