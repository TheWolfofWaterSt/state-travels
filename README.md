# States I've Visited

A personal travel map portfolio built with Next.js 14 (App Router), Neon Postgres, and Tailwind CSS. Mark which US states you've visited, add cities per state, and list places you've been in each city.

## Local development

1. Copy `.env.example` to `.env.local` and fill in values.
2. `npm install`
3. `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000). The app auto-seeds states on first home page load, or call `POST /api/seed` manually.

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEON_DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Single password for `/login` |
| `NEXTAUTH_SECRET` | Random 32+ character secret (reserved for future signed sessions) |

## Deploy (Vercel)

1. Create a project at [neon.tech](https://neon.tech) and copy the connection string.
2. In Vercel project settings, set `NEON_DATABASE_URL`, `ADMIN_PASSWORD`, and `NEXTAUTH_SECRET`.
3. Deploy with `vercel --prod` or connect the GitHub repo for auto-deploy.
4. After first deploy, visit the site once (auto-seed) or `POST /api/seed` to populate all 50 states plus Washington, D.C.
5. Log in at `/login` to edit visited states, cities, and places at `/admin`.

## Data shape

Each state is stored as `visited` plus nested `cities`, each with a `places` list (e.g. Wisconsin → Eau Claire → Half Moon Lake). Saving a state replaces its full city list (removing a city in admin and clicking **Save all** deletes it—no separate delete API). Legacy comma-separated `places` text is migrated once into city rows, then cleared.

## Map SVG

The US map is derived from [Blank US Map (states only).svg](https://commons.wikimedia.org/wiki/File:Blank_US_Map_(states_only).svg) (CC0 public domain). Run `node scripts/process-svg.mjs` after updating `public/us-map-source.svg`.
