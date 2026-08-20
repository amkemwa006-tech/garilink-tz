# GariLink Tz

An original, Tanzania-localised automotive marketplace prototype built with Next.js and TypeScript. It is a clean-room implementation: it uses the GariLink Tz identity, original copy, sample inventory, and placeholder photography.

## Run locally

1. Copy `.env.example` to `.env.local` and adjust values as needed.
2. Install dependencies with `npm install`.
3. Start the site with `npm run dev`.

Open `http://localhost:3000`. The key public routes are `/`, `/cars-for-sale`, `/car-for-sale/toyota/land-cruiser-prado/tx-l/1`, `/finance-calculator`, `/value-my-car`, and `/sell-my-car`.

## Deploy to Netlify

This project is configured as a static export. Run `npm run build`; the deployable site is generated in `out/`. In Netlify, either import this folder/repository and use the included `netlify.toml`, or manually drag the `out` folder into Netlify Drop. No environment variables are needed for this demonstration version.

## Included experience

- Responsive home, results, listing detail, valuation, finance, and selling-wizard flows.
- Tanzanian TSh, +255 contact validation, regional search, vehicle conditions, WhatsApp-first actions, and buyer-safety guidance.
- Client-side seed inventory with search, location filtering, sorting, save controls, price calculation, valuation estimate, enquiry confirmation, and listing submission confirmation.
- SEO metadata, sitemap, and robots configuration.

## Architecture and next steps

The present application is intentionally a self-contained front-end foundation so it can be explored without credentials. Before production, add the requested PostgreSQL/Prisma persistence, Auth.js sessions and server-side RBAC, signed object-storage uploads, rate limiting, CAPTCHA, and provider adapters. Payments, SMS, WhatsApp, maps, valuation, and email remain local mock flows; no production integration is claimed.

The external vehicle photography is supplied only as placeholder imagery and should be replaced with owned, generated, or properly licensed listing photos before launch.
