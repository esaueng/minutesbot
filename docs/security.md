# Security

## Stored Data

D1 stores settings, allowed domains, meeting metadata, attendees and eligibility flags, webhook event metadata/payloads, transcript segments, summary metadata, email delivery metadata, and audit logs. Transcript artifacts and raw invites are stored in R2, not D1.

Attendee stores meeting data separately in the company's self-hosted Attendee instance.

## Secrets

Store `ATTENDEE_API_KEY`, `ATTENDEE_WEBHOOK_SECRET`, `AI_API_KEY`, `EMAIL_API_KEY`, `SMTP_PASSWORD`, and `SESSION_SECRET` with `wrangler secret put`. D1 stores only configured status or secret references.

## Webhooks

Attendee webhooks are verified with HMAC-SHA256 using canonicalized JSON and `X-Webhook-Signature`. Events are deduplicated by `idempotency_key`.

## Recipients

External attendees never receive summaries by default. The recipient policy allows exact domains by default and optional subdomain matching.

## Admin Access and Consent

Use Cloudflare Access to protect the admin UI for the MVP. The meeting bot appears as a participant. The deploying company is responsible for meeting recording/transcription consent policies and compliance.
