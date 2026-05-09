# Security

## Stored Data

D1 stores settings, allowed domains, meeting metadata, attendees and eligibility flags, webhook event metadata/payloads, transcript segments, summary metadata, email delivery metadata, and audit logs. Transcript artifacts and raw invites are stored in R2, not D1.

The meeting bot runtime stores active runtime state in its container process and uploads recordings to R2. Transcript artifacts and raw invites remain outside D1.

## Secrets

Store `BOT_API_KEY`, `BOT_WEBHOOK_SECRET`, `TEAMS_RECORDER_PASSWORD`, `AI_API_KEY`, `EMAIL_API_KEY`, `SMTP_PASSWORD`, and `SESSION_SECRET` with `wrangler secret put`. D1 stores only configured status or secret references.

## Webhooks

Meeting bot webhooks are verified with HMAC-SHA256 using canonicalized JSON and `X-Webhook-Signature`. Events are deduplicated by `idempotency_key`.

## Recipients

External attendees never receive summaries by default. The recipient policy allows exact domains by default and optional subdomain matching.

## Admin Access and Consent

Use Cloudflare Access to protect the admin UI for the MVP. The meeting bot appears as a participant. The deploying company is responsible for meeting recording/transcription consent policies and compliance.
