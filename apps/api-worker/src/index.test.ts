import { describe, expect, it } from "vitest";
import * as entrypoint from "./index";
import { app } from "./index";

describe("api worker", () => {
  it("returns health", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("requires auth configuration for protected admin routes", async () => {
    const response = await app.request("/api/settings");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "AUTH_NOT_CONFIGURED",
        message: "Configure SESSION_SECRET before exposing admin routes."
      }
    });
  });

  it("exports the configured meeting workflow entrypoint", () => {
    expect(entrypoint).toHaveProperty("MeetingWorkflow");
  });
});
