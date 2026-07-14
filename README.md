# Nabla AI — Landing

Marketing site for Nabla AI: a physics-first, GPU-native CFD engine.

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
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata / Open Graph (defaults to `http://localhost:3000`). |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | POST target for the contact form (Formspree, Resend-backed route, or custom API). Until set, submissions are accepted locally so the UI flow works end-to-end. |

## Notes

- The hero visualisation ([components/visuals/flow-canvas.tsx](components/visuals/flow-canvas.tsx)) is a canvas simulation of flow past a cylinder with an adaptive quadtree mesh. It pauses off-screen and renders a static streamline plot under `prefers-reduced-motion`.
- Founder avatars are typographic placeholders, ready to be swapped for photos.
- The footer LinkedIn link is a placeholder (`#`) until the company profile exists.
