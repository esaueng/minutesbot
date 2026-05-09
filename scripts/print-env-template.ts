console.log(`# minutesbot Cloudflare Worker
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ENV=production
APP_BASE_URL=https://notes.company.com
API_BASE_URL=https://api.company.com
ATTENDEE_WEBHOOK_BASE_URL=https://webhook.company.com
ATTENDEE_API_BASE_URL=https://attendee.company.com
ATTENDEE_EXTERNAL_MEDIA_BUCKET_NAME=minutesbot-artifacts
DEFAULT_RECORDER_EMAIL=notetaker@meet.company.com
DEFAULT_SENDER_EMAIL=notetaker@meet.company.com
ENVIRONMENT=production
ATTENDEE_API_KEY=
ATTENDEE_WEBHOOK_SECRET=
OPENROUTER_API_KEY=
SESSION_SECRET=

# Attendee Cloudflare Container router
DATABASE_URL=postgres://...
REDIS_URL=redis://...
DJANGO_SECRET_KEY=
CREDENTIALS_ENCRYPTION_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_RECORDING_BUCKET_NAME=minutesbot-artifacts
DEEPGRAM_API_KEY=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=`);
