# Access Control

minutesbot uses two layers of protection on Cloudflare:

1. Clerk authenticates administrators and protects the web UI and API.
2. Cloudflare Access and WAF rules block unwanted traffic before it reaches the Worker.

## Clerk Setup

Create a Clerk application and set sign-up mode to **Restricted** in the Clerk Dashboard. Add administrators manually or by invitation.

Set these Cloudflare Worker variables and secrets:

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
ADMIN_EMAILS=admin@example.com
CLERK_AUTHORIZED_PARTIES=https://wgs.minutes.bot
```

`ADMIN_EMAILS` is a comma-separated allowlist. You can also set `CLERK_ADMIN_USER_IDS` to a comma-separated list of Clerk user IDs.

The API protects every `/api/*` route except:

- `/api/health`
- `/api/webhooks/attendee`

Attendee webhooks are still protected by `ATTENDEE_WEBHOOK_SECRET`.

## Cloudflare Access and WAF

Protect the admin UI with Cloudflare Access and add WAF custom rules for common scanner paths:

- `/.env`
- `/.git`
- `/wp-admin`
- `/wp-login.php`
- `/phpmyadmin`
- `/xmlrpc.php`

In the Cloudflare dashboard, add project-level IP blocks or custom WAF rules for known unwanted sources. Do not use WAF as the only admin protection; Clerk is the access-control layer.
