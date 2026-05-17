# FuelWise ZA

Angular dashboard for planning around South African fuel prices.

## Features

- Budget impact dashboard with monthly expense categories and real-time fuel-price recalculation.
- Lifestyle simulator for carpooling, insurance changes, ride-sharing, refueling timing, and remote-work savings.
- Client-side budget and scenario state only. Personal figures are not sent to a backend.

## Data

The app loads `/public/data/fuel-prices.json` at runtime. The endpoint default lives in `src/app/services/api-endpoints.ts`, so a backend proxy or paid API can replace the static file without changing feature code.

Do not put private API keys directly into this Angular app. Use a small backend endpoint such as `/api/fuel-prices` to call providers like Fuel SA or OilPriceAPI, then return the JSON to the frontend.

The app keeps a fuel-price fallback in `src/app/data/fuel-prices.ts` so the dashboard still works if the live endpoint is unavailable.

## Run

```bash
npm install
npm start
```

Open `http://127.0.0.1:4200`.

For local API proxy testing, run this in a second terminal:

```bash
npm run api
```

`npm start` proxies `/api` to `http://127.0.0.1:8787`. If the API proxy is not running, the Angular service falls back to the static JSON file in `public/data`.

## Verify

```bash
npm run build
npm test -- --watch=false
```

Or run both with:

```bash
npm run deploy:check
```

## Deploy

For a Node-capable host:

```bash
npm ci
npm run build
npm run serve:prod
```

`serve:prod` serves the built Angular app and the `/api/*` proxy from one process. Configure provider secrets as environment variables, using `.env.example` as the checklist. Keep API keys on the server only.

For a static host such as Netlify, Vercel static output, or Azure Static Web Apps, deploy `dist/south-africa-fuel-app/browser` and implement `/api/fuel-prices` as a platform serverless function. The frontend already calls that path.
