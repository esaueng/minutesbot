# Vercel Deployment Design

## Goal

Make the repository deployable on Vercel with the Vite admin UI and Hono API served from one Vercel project.

## Decision

Vercel will host the minutesbot web app and API entrypoint. Attendee remains a separate external service configured by `ATTENDEE_API_BASE_URL`, `ATTENDEE_API_KEY`, and `ATTENDEE_WEBHOOK_SECRET`; the repo will not fork or vendor Attendee.

Cloudflare-only capabilities in the current codebase, including D1, R2, Queues, Workflows, and Email Workers, are not silently emulated. Vercel runtime support starts with deployable routing, health checks, environment documentation, and clear errors for routes that still require storage or async adapters.

## Architecture

- Vercel builds `apps/web` with Vite and serves `apps/web/dist` as the static output.
- Requests under `/api/*` are routed to a Vercel function that imports the existing Hono app.
- The Hono app gets a Vercel environment object from `process.env`.
- Routes that require D1/R2/Queue/Workflow bindings return a clear setup error until Vercel-native adapters are implemented.
- Attendee integration remains URL-based through the existing `packages/attendee-client` boundary.

## Follow-up Adapter Work

To make all product workflows fully Vercel-native, replace Cloudflare bindings with:

- SQL metadata store: Vercel Postgres or another serverless Postgres provider.
- Artifact store: Vercel Blob.
- Async work: Vercel Queues and Cron endpoints.
- Inbound email: an external inbound email provider that posts parsed messages to a Vercel API route, because Vercel does not provide Cloudflare Email Workers.

## Testing

- Add tests for the Vercel environment adapter.
- Add tests that `/api/health` works through the Vercel export.
- Keep existing Cloudflare Worker tests passing.

