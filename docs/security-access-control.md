# Access Control

minutesbot uses two layers of protection on Cloudflare:

1. A self-hosted admin token protects the web UI and API.
2. Cloudflare Access and WAF rules block unwanted traffic before it reaches the Worker.

## Admin Token Setup

Set a strong `SESSION_SECRET` Cloudflare Worker secret:

```bash
wrangler secret put SESSION_SECRET
```

The admin console stores the entered token in browser local storage and sends it as a bearer token to protected API routes. Rotate `SESSION_SECRET` if the token is exposed.

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

In the Cloudflare dashboard, add project-level IP blocks or custom WAF rules for known unwanted sources. Do not use WAF as the only admin protection; the admin token is the access-control layer.
