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

- The hero background ([components/visuals/hero-video.tsx](components/visuals/hero-video.tsx)) plays `public/videos/meshing-video.mp4` muted, on a loop, at 0.5× speed (roughly 20 seconds per loop). Its framing crops out the source's right-side logo. It pauses off-screen and in hidden tabs, shows a poster under `prefers-reduced-motion`, and includes a play/pause control.
- Founder avatars are typographic placeholders, ready to be swapped for photos.
- The footer LinkedIn link is a placeholder (`#`) until the company profile exists.
