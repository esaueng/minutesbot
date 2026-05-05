import { describe, expect, it } from "vitest";
import { createVercelEnv, unsupportedBindingMessage } from "./vercelEnv";

describe("createVercelEnv", () => {
  it("maps Vercel process environment variables into the API Env shape", () => {
    const env = createVercelEnv({
      APP_BASE_URL: "https://app.example.com",
      API_BASE_URL: "https://app.example.com",
      ATTENDEE_API_BASE_URL: "https://attendee.example.com",
      DEFAULT_RECORDER_EMAIL: "notetaker@example.com",
      DEFAULT_SENDER_EMAIL: "notetaker@example.com",
      ENVIRONMENT: "production",
      ATTENDEE_API_KEY: "attendee-key",
      ATTENDEE_WEBHOOK_SECRET: "webhook-secret",
      AI_API_KEY: "ai-key"
    });

    expect(env.APP_BASE_URL).toBe("https://app.example.com");
    expect(env.API_BASE_URL).toBe("https://app.example.com");
    expect(env.ATTENDEE_API_BASE_URL).toBe("https://attendee.example.com");
    expect(env.DEFAULT_RECORDER_EMAIL).toBe("notetaker@example.com");
    expect(env.DEFAULT_SENDER_EMAIL).toBe("notetaker@example.com");
    expect(env.ENVIRONMENT).toBe("production");
    expect(env.ATTENDEE_API_KEY).toBe("attendee-key");
    expect(env.ATTENDEE_WEBHOOK_SECRET).toBe("webhook-secret");
    expect(env.AI_API_KEY).toBe("ai-key");
  });

  it("uses deployable defaults for optional URL settings", () => {
    const env = createVercelEnv({});

    expect(env.APP_BASE_URL).toBe("http://localhost:3000");
    expect(env.API_BASE_URL).toBe("http://localhost:3000");
    expect(env.ATTENDEE_API_BASE_URL).toBe("http://localhost:8000");
    expect(env.DEFAULT_RECORDER_EMAIL).toBe("notetaker@example.com");
    expect(env.DEFAULT_SENDER_EMAIL).toBe("notetaker@example.com");
    expect(env.ENVIRONMENT).toBe("development");
  });

  it("throws a clear setup error when a Cloudflare binding is used on Vercel", async () => {
    const env = createVercelEnv({});

    await expect(env.DB.prepare("SELECT 1").first()).rejects.toThrow(unsupportedBindingMessage("DB"));
    await expect(env.ARTIFACTS.get("missing")).rejects.toThrow(unsupportedBindingMessage("ARTIFACTS"));
    await expect(env.SUMMARY_QUEUE.send({ type: "summarize", meetingId: "mtg_1" })).rejects.toThrow(unsupportedBindingMessage("SUMMARY_QUEUE"));
    await expect(env.MEETING_WORKFLOW.create({ id: "meeting-mtg_1", params: { meetingId: "mtg_1" } })).rejects.toThrow(
      unsupportedBindingMessage("MEETING_WORKFLOW")
    );
  });
});

