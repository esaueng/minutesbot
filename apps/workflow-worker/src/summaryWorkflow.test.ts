import { defaultSettings } from "@minutesbot/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAndSendSummary } from "./summaryWorkflow";
import { summarizeTranscript } from "@minutesbot/summary-engine";

vi.mock("@minutesbot/summary-engine", () => ({
  createOpenAiCompatibleProvider: vi.fn(() => ({})),
  meetingRecapTypeLabels: {
    weekly_spqrc: "Weekly SPQRC",
    weekly_sales: "Weekly Sales",
    plant_meeting: "Individual Plant Meeting",
    general: "General"
  },
  summarizeTranscript: vi.fn(async () => ({
    meetingType: "general",
    recapDepth: "standard",
    meetingNotes: [],
    followUpTasks: [],
    summary: ["Summary ready."],
    decisions: [],
    actionItems: [],
    openQuestions: [],
    risks: [],
    followUps: []
  }))
}));

class FakeD1 {
  emailDeliveries: unknown[][] = [];

  prepare(sql: string) {
    const db = this;
    return {
      values: [] as unknown[],
      bind(...values: unknown[]) {
        this.values = values;
        return this;
      },
      async first() {
        if (sql.includes("FROM meetings")) {
          return {
            id: "mtg_1",
            subject: "Project Sync",
            organizer_email: "owner@wgs.bot",
            organizer_name: "Owner",
            start_time: "2026-05-04T15:00:00.000Z",
            end_time: "2026-05-04T15:02:00.000Z"
          };
        }
        if (sql.includes("FROM settings")) {
          return {
            key: "app",
            value: JSON.stringify({
              ...defaultSettings,
              primaryDomain: "wgs.bot",
              allowedDomains: ["partner.com"],
              policy: { ...defaultSettings.policy, allowSubdomains: true },
              email: { ...defaultSettings.email, provider: "cloudflare-email-service" }
            }),
            updated_at: "2026-05-04T00:00:00.000Z"
          };
        }
        return null;
      },
      async all() {
        if (sql.includes("FROM artifacts")) {
          return { results: [{ type: "transcript_text", r2_key: "transcripts/mtg_1/transcript.txt", deleted_at: null }] };
        }
        if (sql.includes("FROM attendees")) {
          return {
            results: [
              { email: "alex@team.wgs.bot", name: "Alex", summary_eligible: 1 },
              { email: "casey@partner.com", name: "Casey", summary_eligible: 1 },
              { email: "vendor@example.net", name: "Vendor", summary_eligible: 0 }
            ]
          };
        }
        if (sql.includes("FROM transcript_segments")) {
          return {
            results: [
              { speaker_name: "Alex", timestamp_ms: 0, duration_ms: 30_000, text: "hello" },
              { speaker_name: "Casey", timestamp_ms: 45_000, duration_ms: 30_000, text: "status update" }
            ]
          };
        }
        return { results: [] };
      },
      async run() {
        if (sql.includes("INSERT INTO email_deliveries")) db.emailDeliveries.push(this.values);
        return { success: true };
      }
    };
  }
}

describe("summary workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends recaps to organizer and allowed-domain attendees and records deliveries", async () => {
    const db = new FakeD1();
    const send = vi.fn(async (message: unknown) => ({ id: `msg-${(message as { to: string }).to}` }));

    await generateAndSendSummary(
      {
        DB: db as unknown as D1Database,
        ARTIFACTS: {
          get: vi.fn(async () => ({ text: async () => "Alex: hello" })),
          put: vi.fn(async () => undefined)
        } as unknown as R2Bucket,
        INVITE_QUEUE: { send: vi.fn() },
        SUMMARY_QUEUE: { send: vi.fn() },
        EMAIL_QUEUE: { send: vi.fn() },
        ATTENDEE_API_BASE_URL: "https://attendee.wgsglobal.app",
        API_BASE_URL: "https://minutesbot-api.wgsglobal.app",
        AI_API_KEY: "test-ai-key",
        SESSION_SECRET: "session-secret",
        SEND_EMAIL: { send }
      },
      "mtg_1"
    );

    expect(send.mock.calls.map(([message]) => (message as { to: string }).to)).toEqual(["owner@wgs.bot", "alex@team.wgs.bot", "casey@partner.com"]);
    expect(db.emailDeliveries.map((values) => values[2])).toEqual(["owner@wgs.bot", "alex@team.wgs.bot", "casey@partner.com"]);
    expect(db.emailDeliveries.every((values) => values[4] === "sent")).toBe(true);
    expect(send.mock.calls[0][0]).toMatchObject({
      from: "WGS Notetaker <notetaker@wgs.bot>",
      text: expect.stringContaining("/api/artifacts/mtg_1/transcript.txt?token="),
      html: expect.stringContaining("Download raw transcript")
    });
  });

  it("passes recap classification defaults into summary generation", async () => {
    const db = new FakeD1();

    await generateAndSendSummary(
      {
        DB: db as unknown as D1Database,
        ARTIFACTS: {
          get: vi.fn(async () => ({ text: async () => "Alex: hello" })),
          put: vi.fn(async () => undefined)
        } as unknown as R2Bucket,
        INVITE_QUEUE: { send: vi.fn() },
        SUMMARY_QUEUE: { send: vi.fn() },
        EMAIL_QUEUE: { send: vi.fn() },
        ATTENDEE_API_BASE_URL: "https://attendee.wgsglobal.app",
        API_BASE_URL: "https://minutesbot-api.wgsglobal.app",
        AI_API_KEY: "test-ai-key",
        SESSION_SECRET: "session-secret",
        SEND_EMAIL: { send: vi.fn(async () => ({ id: "msg-1" })) }
      },
      "mtg_1"
    );

    expect(vi.mocked(summarizeTranscript).mock.calls[0][0]).toMatchObject({
      classificationEnabled: true,
      defaultTemplate: "auto",
      shortMeetingBriefRecapEnabled: true,
      shortMeetingDurationThresholdMinutes: 2,
      meetingEndTime: "2026-05-04T15:02:00.000Z",
      meetingDurationMinutes: 2,
      transcriptDurationMinutes: 1.3,
      speakerTurnCount: 2,
      wordCount: 2
    });
  });
});
