# Access Control

minutesbot uses two layers of protection on Vercel:

1. Clerk authenticates administrators and protects the web UI and API.
2. Vercel WAF blocks obvious unwanted traffic before it reaches the app.

## Clerk Setup

Create a Clerk application and set sign-up mode to **Restricted** in the Clerk Dashboard. Add administrators manually or by invitation.

Set these Vercel environment variables:

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
ADMIN_EMAILS=admin@example.com
CLERK_AUTHORIZED_PARTIES=https://your-vercel-domain.example
```

`ADMIN_EMAILS` is a comma-separated allowlist. You can also set `CLERK_ADMIN_USER_IDS` to a comma-separated list of Clerk user IDs.

The API protects every `/api/*` route except:

- `/api/health`
- `/api/webhooks/attendee`

Attendee webhooks are still protected by `ATTENDEE_WEBHOOK_SECRET`.

## Vercel WAF

The repo includes Vercel route mitigation rules for common scanner paths:

- `/.env`
- `/.git`
- `/wp-admin`
- `/wp-login.php`
- `/phpmyadmin`
- `/xmlrpc.php`

In the Vercel dashboard, also open **Firewall** for the project and add project-level IP blocks or custom rules for known unwanted sources. Do not use WAF as the only admin protection; Clerk is the access-control layer.

