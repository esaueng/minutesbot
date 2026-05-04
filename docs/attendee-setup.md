# Attendee Setup

Deploy Attendee separately. Do not fork or vendor Attendee into this repository by default.

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

Review Attendee's Elastic License 2.0, including managed-service restrictions.

Troubleshooting focus areas: bot stuck in waiting room, incomplete transcription, empty transcript, invalid webhook signature, and Attendee auth failure.
