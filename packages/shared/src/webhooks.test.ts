import { describe, expect, it } from "vitest";
import { attendeeWebhookUrl } from "./webhooks";

describe("attendeeWebhookUrl", () => {
  it("uses the dedicated Attendee webhook base URL when configured", () => {
    expect(
      attendeeWebhookUrl({
        API_BASE_URL: "https://minutesbot-api.wgsglobal.app",
        ATTENDEE_WEBHOOK_BASE_URL: "https://minutesbot-webhook.wgsglobal.app"
      })
    ).toBe("https://minutesbot-webhook.wgsglobal.app/api/webhooks/attendee");
  });

  it("falls back to API_BASE_URL for existing deployments", () => {
    expect(attendeeWebhookUrl({ API_BASE_URL: "https://admin.minutes.bot/" })).toBe("https://admin.minutes.bot/api/webhooks/attendee");
  });
});
