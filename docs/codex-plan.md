# minutesbot Living Implementation Plan

This plan tracks the MVP requested in the initial project prompt. The implementation is intentionally single-tenant and self-hosted. Attendee remains a separate deployment and performs the Teams meeting bot recording/transcription work.

## Milestones

1. Create repo skeleton, AGENTS.md, workspace configuration, Cloudflare config, and D1 migrations.
2. Implement shared types, settings validation, dates, IDs, status values, JSON helpers, and structured errors.
3. Implement D1 query helpers for settings, meetings, attendees, artifacts, audit logs, summaries, webhook events, and email deliveries.
4. Build settings API and admin status/test endpoints with clean Zod validation and no secret exposure.
5. Build React + Vite admin shell with Setup, Settings, Attendee status, Meetings, Meeting detail, and Logs pages.
6. Implement recipient domain policy with exact matching by default and optional subdomain matching.
7. Implement invite parser with Teams URL extraction, ICS parsing, attendee normalization, and fixtures.
8. Implement Email Worker inbound invite ingestion, rejection states, raw invite storage, audit logs, and meeting scheduling.
9. Implement fetch-based Attendee REST client, typed errors, transcript fetching, delete_data, and webhook signature verification.
10. Implement Attendee webhook endpoint with signature verification, idempotency, state updates, transcript segment storage, and transcript fetch queueing.
11. Implement Workflow/queue orchestration for bot creation, transcript fetch/finalization, summary generation/email, and retention cleanup.
12. Implement summary engine using OpenAI-compatible strict JSON output with a Workers AI placeholder.
13. Implement email renderer and provider abstraction with mock fallback and Cloudflare Email Service support.
14. Implement admin test tools, artifact deletion, retry controls, and audit log visibility.
15. Complete deployment scripts and docs for architecture, Cloudflare, Attendee, security, operations, troubleshooting, and local development.
16. Run install, build, test, typecheck, and lint. Fix failures before final handoff.

## Acceptance Criteria Tracking

The MVP is complete only when a self-hosted admin can configure minutesbot, receive and parse Teams invites, schedule Attendee bot creation, verify Attendee webhooks, store transcripts/artifacts, summarize transcript content, filter recipients, send summaries only to eligible same-company recipients, and manage retries/deletion/audit logs. Real Cloudflare and real Attendee integration still require tenant validation after local tests pass.
