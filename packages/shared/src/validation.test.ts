import { describe, expect, it } from "vitest";
import { defaultSettings, parseSettings } from "./validation";

describe("settings validation", () => {
  it("normalizes domains and emails", () => {
    const settings = parseSettings({
      ...defaultSettings,
      primaryDomain: "AcMe.COM",
      allowedDomains: ["AcMe.COM", "acme.com"],
      recorderEmail: "NoteTaker@Meet.AcMe.COM",
      email: { ...defaultSettings.email, senderEmail: "Notes@AcMe.COM" }
    });

    expect(settings.primaryDomain).toBe("acme.com");
    expect(settings.allowedDomains).toEqual(["acme.com"]);
    expect(settings.recorderEmail).toBe("notetaker@meet.acme.com");
    expect(settings.email.senderEmail).toBe("notes@acme.com");
  });

  it("rejects invalid domains, emails, and urls", () => {
    expect(() =>
      parseSettings({
        ...defaultSettings,
        primaryDomain: "not a domain",
        recorderEmail: "invalid",
        attendee: { ...defaultSettings.attendee, baseUrl: "nope" }
      })
    ).toThrow();
  });

  it("keeps secret statuses as booleans only", () => {
    const settings = parseSettings({
      ...defaultSettings,
      attendee: { ...defaultSettings.attendee, apiKeyConfigured: true, webhookSecretConfigured: true },
      ai: { ...defaultSettings.ai, apiKeyConfigured: true }
    });

    expect(settings.attendee.apiKeyConfigured).toBe(true);
    expect(settings.attendee.webhookSecretConfigured).toBe(true);
    expect(settings.ai.apiKeyConfigured).toBe(true);
    expect(JSON.stringify(settings)).not.toContain("sk-");
  });
});
