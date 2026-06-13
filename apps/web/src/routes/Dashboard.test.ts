import { describe, expect, it } from "vitest";
import { botRuntimeCheckMessage } from "./Dashboard";

describe("botRuntimeCheckMessage", () => {
  it("prefers the readiness failure reason returned by the API", () => {
    expect(botRuntimeCheckMessage({ ok: false, ready: { ready: false, reason: "Redeploy the bot container." } })).toBe(
      "Redeploy the bot container."
    );
  });

  it("summarizes failed runtime health checks when readiness has no reason", () => {
    expect(
      botRuntimeCheckMessage({
        ok: false,
        health: {
          checks: {
            chromium: { ok: true },
            ffmpeg: { ok: false, detail: "ffmpeg missing" },
            config: { ok: false }
          }
        }
      })
    ).toBe("Failed checks: ffmpeg: ffmpeg missing, config");
  });
});
