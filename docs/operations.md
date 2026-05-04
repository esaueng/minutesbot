# Operations

Use `/api/health` and `pnpm check` for basic health checks.

Admins can:

- Retry bot creation.
- Fetch transcript again.
- Retry summary generation.
- Delete R2 artifacts.
- Call Attendee `delete_data` when needed.
- Review audit logs and webhook events.

Retention cleanup deletes old raw invites, transcripts, summaries, and audit logs according to settings and marks artifacts as deleted after R2 deletion.

Status meanings are intentionally explicit: invite rejection statuses identify policy failures, bot statuses mirror Attendee state, transcript statuses separate partial/complete/unavailable/failed, and summary statuses track queued/generating/ready/sent/failed.
