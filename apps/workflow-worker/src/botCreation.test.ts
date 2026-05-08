import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@minutesbot/shared";
import { createMeetingBot } from "./botCreation";
import type { WorkflowEnv } from "./env";

class BotCreationD1 {
  meeting = {
    id: "mtg_1",
    calendar_uid: "teams-link-1",
    teams_join_url: "https://teams.microsoft.com/l/meetup-join/abc",
    status: "SCHEDULED"
  };
  settings = defaultSettings;
  statusUpdates: Array<{ status: string; latestError: string | null }> = [];
  auditLogs: Array<{ eventType: string; metadata: unknown }> = [];

  prepare(sql: string) {
    const db = this;
    return {
      values: [] as unknown[],
      bind(...values: unknown[]) {
        this.values = values;
        return this;
      },
      async first<T>() {
        if (sql.includes("FROM meetings")) return db.meeting as T;
        if (sql.includes("FROM settings")) {
          return { key: "app", value: JSON.stringify(db.settings), updated_at: new Date().toISOString() } as T;
        }
        return null;
      },
      async run() {
        if (sql.startsWith("UPDATE meetings SET status")) {
          db.statusUpdates.push({ status: this.values[0] as string, latestError: this.values[1] as string | null });
        }
        if (sql.startsWith("INSERT INTO audit_logs")) {
          db.auditLogs.push({ eventType: this.values[2] as string, metadata: this.values[5] ? JSON.parse(this.values[5] as string) : null });
        }
        return { success: true };
      }
    };
  }
}

class BotImageR2 {
  constructor(private readonly image: Uint8Array) {}

  async get(key: string) {
    if (key !== "settings/attendee-bot-image.png") return null;
    return {
      arrayBuffer: async () => this.image.buffer.slice(this.image.byteOffset, this.image.byteOffset + this.image.byteLength)
    };
  }
}

function env(overrides: Partial<WorkflowEnv> = {}, db = new BotCreationD1()): WorkflowEnv {
  return {
    DB: db as unknown as D1Database,
    ARTIFACTS: {} as R2Bucket,
    INVITE_QUEUE: { send: vi.fn() },
    SUMMARY_QUEUE: { send: vi.fn() },
    EMAIL_QUEUE: { send: vi.fn() },
    ATTENDEE_API_BASE_URL: "https://attendee.example.com",
    ATTENDEE_API_KEY: "attendee-secret",
    ATTENDEE_EXTERNAL_MEDIA_BUCKET_NAME: "minutesbot-artifacts",
    API_BASE_URL: "https://minutesbot.example.com",
    ATTENDEE_WEBHOOK_BASE_URL: "https://minutesbot-webhook.wgsglobal.app",
    ...overrides
  };
}

describe("createMeetingBot failure handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds the uploaded bot image and configured Teams display name to Attendee bot creation", async () => {
    const db = new BotCreationD1();
    db.settings = {
      ...defaultSettings,
      attendee: {
        ...defaultSettings.attendee,
        botName: "WGS Meeting Assistant",
        botImage: {
          r2Key: "settings/attendee-bot-image.png",
          contentType: "image/png",
          fileName: "wgsbot.png",
          uploadedAt: "2026-05-06T12:00:00.000Z"
        }
      }
    };
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        requests.push({ url: String(url), init });
        if (String(url).endsWith("/_ops/health")) return Response.json({ ok: true, runtime: "cloudflare-containers", missing: [] });
        return Response.json({ id: "bot_1", meeting_url: "https://teams.microsoft.com/l/meetup-join/abc", state: "joining" }, { status: 201 });
      })
    );

    await createMeetingBot(env({ ARTIFACTS: new BotImageR2(new Uint8Array([1, 2, 3])) as unknown as R2Bucket }, db), "mtg_1");

    const createRequest = requests.find((request) => request.url.endsWith("/api/v1/bots"));
    expect(JSON.parse(createRequest?.init?.body as string)).toMatchObject({
      bot_name: "WGS Meeting Assistant",
      bot_image: {
        type: "image/png",
        data: "AQID"
      }
    });
  });

  it("creates Attendee bots with MP3 recording upload to R2", async () => {
    const db = new BotCreationD1();
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        requests.push({ url: String(url), init });
        if (String(url).endsWith("/_ops/health")) return Response.json({ ok: true, runtime: "cloudflare-containers", missing: [] });
        return Response.json({ id: "bot_1", meeting_url: "https://teams.microsoft.com/l/meetup-join/abc", state: "joining" }, { status: 201 });
      })
    );

    await createMeetingBot(env({}, db), "mtg_1");

    const createRequest = requests.find((request) => request.url.endsWith("/api/v1/bots"));
    expect(createRequest).toBeDefined();
    expect(JSON.parse(createRequest?.init?.body as string)).toMatchObject({
      meeting_url: "https://teams.microsoft.com/l/meetup-join/abc",
      bot_name: "minutesbot",
      bot_chat_message: "Hi, I'm minutesbot, an automated WGS meeting notetaker. I record and transcribe this meeting so the team can receive a recap.",
      recording_settings: { format: "mp3" },
      external_media_storage_settings: {
        bucket_name: "minutesbot-artifacts",
        recording_file_name: "recordings/mtg_1/recording.mp3"
      },
      webhooks: [
        {
          url: "https://minutesbot-webhook.wgsglobal.app/api/webhooks/attendee"
        }
      ]
    });
  });

  it("stores a visible failure when ATTENDEE_API_KEY is missing", async () => {
    const db = new BotCreationD1();

    await expect(createMeetingBot(env({ ATTENDEE_API_KEY: undefined }, db), "mtg_1")).rejects.toMatchObject({
      code: "ATTENDEE_API_KEY_MISSING"
    });

    expect(db.statusUpdates.at(-1)).toEqual({
      status: "FAILED",
      latestError: "ATTENDEE_API_KEY_MISSING: ATTENDEE_API_KEY secret is not configured"
    });
    expect(db.auditLogs.at(-1)).toMatchObject({ eventType: "bot.fatal_error" });
  });

  it("stores a visible failure when Attendee cannot be reached", async () => {
    const db = new BotCreationD1();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      })
    );

    await expect(createMeetingBot(env({}, db), "mtg_1")).rejects.toThrow("fetch failed");

    expect(db.statusUpdates.at(-1)).toEqual({
      status: "FAILED",
      latestError: "ATTENDEE_CREATE_FAILED: fetch failed"
    });
    expect(db.auditLogs.at(-1)).toMatchObject({ eventType: "bot.fatal_error" });
  });

  it("stores a visible failure when Attendee rejects bot creation", async () => {
    const db = new BotCreationD1();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ ok: true, runtime: "cloudflare-containers", missing: [] }))
        .mockResolvedValueOnce(new Response("bad auth", { status: 401 }))
    );

    await expect(createMeetingBot(env({}, db), "mtg_1")).rejects.toMatchObject({ code: "ATTENDEE_AUTH_FAILED" });

    expect(db.statusUpdates.at(-1)).toEqual({
      status: "FAILED",
      latestError: "ATTENDEE_AUTH_FAILED: Attendee request failed with 401"
    });
    expect(db.auditLogs.at(-1)).toMatchObject({ eventType: "bot.fatal_error" });
  });

  it("stores a visible failure when Attendee health reports missing runtime settings", async () => {
    const db = new BotCreationD1();
    db.settings = {
      ...defaultSettings,
      attendee: {
        ...defaultSettings.attendee,
        baseUrl: "https://attendee.wgsglobal.app"
      }
    };
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        requests.push(String(url));
        return new Response(JSON.stringify({ ok: false, runtime: "cloudflare-containers", missing: ["DATABASE_URL", "REDIS_URL"] }), {
          status: 503,
          headers: { "content-type": "application/json" }
        });
      })
    );

    await expect(createMeetingBot(env({ ATTENDEE_API_BASE_URL: "https://attendee.wgsglobal.app" }, db), "mtg_1")).rejects.toMatchObject({
      code: "ATTENDEE_UNHEALTHY"
    });

    expect(requests).toEqual(["https://attendee.wgsglobal.app/_ops/health"]);
    expect(db.statusUpdates.at(-1)).toEqual({
      status: "FAILED",
      latestError: "ATTENDEE_UNHEALTHY: Attendee health check failed: missing DATABASE_URL, REDIS_URL"
    });
    expect(db.auditLogs.at(-1)).toMatchObject({
      eventType: "bot.fatal_error",
      metadata: { code: "ATTENDEE_UNHEALTHY" }
    });
  });
});
