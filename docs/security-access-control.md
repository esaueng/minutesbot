# Access Control

minutesbot uses layered protection on Cloudflare:

1. Cloudflare Access can protect the Worker route before traffic reaches the app.
2. The Worker validates Cloudflare Access JWTs when Access vars are configured.
3. A self-hosted admin token remains as the fallback for deployments without Cloudflare Access.
4. WAF rules block unwanted traffic before it reaches the Worker.

## Admin Token Setup

Set a strong `SESSION_SECRET` Cloudflare Worker secret:

```bash
wrangler secret put SESSION_SECRET
```

The admin console stores the entered token in browser local storage and sends it as a bearer token to protected API routes. Rotate `SESSION_SECRET` if the token is exposed. When Cloudflare Access validation is configured, a valid Access JWT is sufficient for protected admin UI/API routes and the admin token fallback is skipped.

The API protects every `/api/*` route except:

- `/api/health`
- `/api/webhooks/attendee`

Attendee webhooks are still protected by `ATTENDEE_WEBHOOK_SECRET`.

## Cloudflare Access JWT Validation

The Worker validates the `Cf-Access-Jwt-Assertion` header when these non-secret vars are configured:

```text
CLOUDFLARE_ACCESS_AUD=13f67694a98579897f6175043bb595df17afdfd5129d44c33e8b937b5576ae71
CLOUDFLARE_ACCESS_JWKS_URL=https://esau.cloudflareaccess.com/cdn-cgi/access/certs
CLOUDFLARE_ACCESS_ISSUER=https://esau.cloudflareaccess.com
```

These values match the Access application enabled for `admin.minutes.bot`. The JWKS URL may rotate keys over time; the Worker loads the current key set and caches it briefly.

## Cloudflare Access and WAF

Protect the admin UI with Cloudflare Access and add WAF custom rules for common scanner paths:

- `/.env`
- `/.git`
- `/wp-admin`
- `/wp-login.php`
- `/phpmyadmin`
- `/xmlrpc.php`

In the Cloudflare dashboard, add project-level IP blocks or custom WAF rules for known unwanted sources. Do not use WAF as the only admin protection; the admin token is the access-control layer.

Add a narrow skip rule before any challenge/block rules so Attendee webhook delivery reaches the Worker:

```text
http.host eq "admin.minutes.bot" and http.request.uri.path eq "/api/webhooks/attendee" and http.request.method eq "POST"
```

The rule should use Cloudflare's `skip` action for browser/security challenges only on that exact POST endpoint. In ruleset JSON, minutesbot applies:

```json
{
  "ref": "minutesbot_attendee_webhook_security_exception",
  "action": "skip",
  "action_parameters": {
    "ruleset": "current",
    "phases": ["http_request_firewall_managed", "http_request_sbfm"],
    "products": ["bic", "securityLevel", "uaBlock", "waf"]
  }
}
```

This does not make the webhook unauthenticated. `/api/webhooks/attendee` still verifies Attendee's `X-Webhook-Signature` with `ATTENDEE_WEBHOOK_SECRET`, and unsigned POSTs should return `401 INVALID_WEBHOOK_SIGNATURE` from the Worker instead of a Cloudflare HTML challenge page.

To apply the exception with a Cloudflare API token that can edit zone rulesets:

```bash
CLOUDFLARE_API_TOKEN=... pnpm cloudflare:ensure-webhook-bypass
```
