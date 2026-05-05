import { describe, expect, it } from "vitest";
import app from "./index";

describe("vercel api entrypoint", () => {
  it("serves the existing Hono health route", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});

