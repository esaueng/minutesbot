import { describe, expect, it } from "vitest";
import { deployAttendee, verifyAttendeeHealth } from "./deploy-attendee";

describe("deployAttendee", () => {
  it("deploys the Attendee container config before checking health", async () => {
    const events: string[] = [];

    await deployAttendee({
      runCommand: async (command, args) => {
        events.push(`${command} ${args.join(" ")}`);
      },
      fetchHealth: async (url) => {
        events.push(`fetch ${url}`);
        return Response.json({ ok: true });
      },
      log: () => undefined,
      error: () => undefined
    });

    expect(events).toEqual([
      "wrangler deploy --config deploy/attendee-container/wrangler.jsonc",
      "fetch https://attendee.example.com/_ops/health"
    ]);
  });
});

describe("verifyAttendeeHealth", () => {
  it("fails clearly when the Attendee host is unreachable", async () => {
    const messages: string[] = [];

    await expect(
      verifyAttendeeHealth({
        baseUrl: "https://attendee.company.com",
        fetchHealth: async () => {
          throw new TypeError("fetch failed");
        },
        error: (message) => messages.push(message)
      })
    ).rejects.toThrow("Attendee health check failed");

    expect(messages).toEqual([
      "Attendee health check failed for https://attendee.company.com/_ops/health: fetch failed",
      "Confirm the Attendee Worker route/custom domain exists and DNS resolves before retrying bot creation."
    ]);
  });

  it("fails clearly when the Attendee health endpoint is unhealthy", async () => {
    const messages: string[] = [];

    await expect(
      verifyAttendeeHealth({
        baseUrl: "https://attendee.company.com",
        fetchHealth: async () => new Response("missing settings", { status: 503 }),
        error: (message) => messages.push(message)
      })
    ).rejects.toThrow("Attendee health check returned 503");

    expect(messages[0]).toBe("Attendee health check returned 503 for https://attendee.company.com/_ops/health: missing settings");
  });

  it("accepts healthy Attendee responses", async () => {
    const messages: string[] = [];

    await expect(
      verifyAttendeeHealth({
        baseUrl: "https://attendee.company.com",
        fetchHealth: async () => Response.json({ ok: true }),
        log: (message) => messages.push(message)
      })
    ).resolves.toBeUndefined();

    expect(messages).toEqual(["Attendee health check succeeded for https://attendee.company.com/_ops/health."]);
  });
});
