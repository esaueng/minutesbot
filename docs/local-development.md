# Local Development

```bash
pnpm install
pnpm db:migrate:local
pnpm seed:dev
pnpm dev
```

The admin UI runs with Vite. Workers can be run with Wrangler locally using the root `wrangler.jsonc`.

For local Attendee work, use a mocked fetch client in tests or point settings at a development Attendee deployment. Do not vendor Attendee into the minutesbot Worker. To prepare upstream Attendee for the optional Cloudflare Container deployment, run `pnpm attendee:prepare`; this clones Attendee into ignored `.attendee/upstream`.

Invite parser fixtures live in `packages/invite-parser/src/fixtures`.

Run:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```
