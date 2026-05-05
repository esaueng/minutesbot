# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current minutesbot monorepo deployable as a Vercel project.

**Architecture:** Keep the existing Vite frontend and Hono API. Add a Vercel function entrypoint, Vercel project config, and a runtime environment adapter that exposes process environment variables and clear unsupported-binding behavior.

**Tech Stack:** TypeScript, pnpm workspaces, Vite, React, Hono, Vercel Functions.

---

### Task 1: Vercel Environment Adapter

**Files:**
- Create: `apps/api-worker/src/vercelEnv.ts`
- Test: `apps/api-worker/src/vercelEnv.test.ts`

- [ ] **Step 1: Write the failing test**

Create tests that assert Vercel environment variables are mapped and missing Cloudflare bindings are represented by throwing placeholders.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test apps/api-worker/src/vercelEnv.test.ts`

- [ ] **Step 3: Implement the adapter**

Create `createVercelEnv()` and small unsupported binding helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test apps/api-worker/src/vercelEnv.test.ts`

### Task 2: Vercel API Entrypoint

**Files:**
- Create: `api/index.ts`
- Create: `api/index.test.ts`

- [ ] **Step 1: Write the failing test**

Test that the Vercel export can serve `/api/health`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test api/index.test.ts`

- [ ] **Step 3: Implement the Vercel entrypoint**

Export the existing Hono app as the default Vercel function app and attach Vercel env middleware.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test api/index.test.ts`

### Task 3: Vercel Project Configuration and Docs

**Files:**
- Create: `vercel.json`
- Modify: `package.json`
- Modify: `README.md`
- Create: `docs/vercel-deployment.md`

- [ ] **Step 1: Add config**

Set Vercel to build `apps/web`, serve `apps/web/dist`, and route `/api/*` to the Hono function.

- [ ] **Step 2: Add scripts and docs**

Document Vercel environment variables, deployment commands, and the Attendee boundary.

- [ ] **Step 3: Verify**

Run: `pnpm build`, `pnpm test`, `pnpm typecheck`.

