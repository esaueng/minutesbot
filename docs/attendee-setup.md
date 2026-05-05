# Attendee Setup

Deploy Attendee separately. Do not fork or vendor Attendee into the minutesbot Worker bundle.

Strict Cloudflare-only Attendee hosting is not feasible today. Upstream Attendee is a Dockerized Django/Celery application with Chrome/ChromeDriver, PulseAudio, ffmpeg, native Linux packages, Postgres, Redis, and long-running worker process requirements. It cannot run on Workers/D1/R2 alone.

The supported Cloudflare-hosted option is:

```text
minutesbot on Cloudflare Workers + Attendee on Cloudflare Containers + external Postgres/Redis
```

Example:

```bash
ATTENDEE_API_BASE_URL=https://attendee.company.com
wrangler secret put ATTENDEE_API_KEY
wrangler secret put ATTENDEE_WEBHOOK_SECRET
```

Create an Attendee API key in the Attendee deployment and configure the webhook secret. The webhook URL is:

```text
https://api.company.com/api/webhooks/attendee
```

Attendee must be configured with the meeting platform prerequisites it requires to join Microsoft Teams meetings. minutesbot only sends meeting URLs and receives webhooks/transcripts.

For Cloudflare Containers, use the scaffold in `deploy/attendee-container`:

```bash
pnpm attendee:prepare
wrangler secret put DATABASE_URL --config deploy/attendee-container/wrangler.jsonc
wrangler secret put REDIS_URL --config deploy/attendee-container/wrangler.jsonc
wrangler secret put SECRET_KEY --config deploy/attendee-container/wrangler.jsonc
pnpm attendee:deploy
```

Attendee companion services and credentials still need to be supplied: Postgres, Redis-compatible cache/broker, object storage credentials, meeting platform credentials, transcription provider credentials, and mail settings. R2 can be used through its S3-compatible API for object storage, but it does not replace Postgres or Redis.

Review Attendee's Elastic License 2.0, including managed-service restrictions.

Troubleshooting focus areas: bot stuck in waiting room, incomplete transcription, empty transcript, invalid webhook signature, and Attendee auth failure.
