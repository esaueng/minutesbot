# Vercel Deployment

This repo can be imported into Vercel as a pnpm monorepo project.

## What Vercel Runs

- `apps/web`: Vite admin UI, built to `apps/web/dist`.
- `api/index.ts` and `api/[...path].ts`: Vercel Functions that forward requests to the existing Hono API.
- Attendee: external service configured through `ATTENDEE_API_BASE_URL`.

The current product code still contains Cloudflare-specific storage and async bindings. On Vercel, routes that need `DB`, `ARTIFACTS`, queues, or workflows return a clear adapter error until Vercel-native replacements are added.

## Vercel Project Settings

Use these settings when importing the repository:

- Framework preset: Other
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run vercel:build`
- Output directory: `apps/web/dist`

## Environment Variables

Set these in Vercel project settings:

```text
APP_BASE_URL=https://your-vercel-domain.example
API_BASE_URL=https://your-vercel-domain.example
ATTENDEE_API_BASE_URL=https://your-attendee-domain.example
DEFAULT_RECORDER_EMAIL=notetaker@example.com
DEFAULT_SENDER_EMAIL=notetaker@example.com
ENVIRONMENT=production
ATTENDEE_API_KEY=...
ATTENDEE_WEBHOOK_SECRET=...
AI_API_KEY=...
SESSION_SECRET=...
```

## Attendee Boundary

Attendee is not vendored into this repository. Run Attendee as its own service and point `ATTENDEE_API_BASE_URL` to it. Attendee is a Django/Docker service with Postgres and Redis requirements, so it is not a fit for this repo's Vercel Functions deployment without a separate fork or platform-specific rewrite.

## Full Vercel-Native Follow-up

To remove the remaining Cloudflare runtime dependencies, add adapters for:

- Vercel Postgres or another serverless Postgres provider for metadata.
- Vercel Blob for invite, transcript, summary, and artifact storage.
- Vercel Queues and Cron endpoints for async processing.
- An inbound email provider that posts invite payloads to a Vercel API route.

