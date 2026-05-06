import { describe, expect, it, vi } from "vitest";
import { handleInvite } from "./index";

class FakeD1 {
  prepare() {
    return {
      bind() {
        return this;
      },
      async first() {
        return null;
      },
      async run() {
        return { success: true };
      },
      async all() {
        return { results: [] };
      }
    };
  }
}

describe("email worker invite handling", () => {
  it("rejects wrong recorder recipient", async () => {
    const setReject = vi.fn();
    const env = {
      DB: new FakeD1() as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      MEETING_WORKFLOW: { create: vi.fn(async () => undefined) }
    };

    await handleInvite(
      { from: "alice@wgs.bot", to: "wrong@wgs.bot", setReject },
      env,
      `From: Alice <alice@wgs.bot>
To: wrong@wgs.bot

BEGIN:VCALENDAR
METHOD:REQUEST
BEGIN:VEVENT
UID:test
SUMMARY:Test
DTSTART:20260504T150000Z
DTEND:20260504T153000Z
ORGANIZER;CN=Alice:mailto:alice@wgs.bot
ATTENDEE;CN=Alex;ROLE=REQ-PARTICIPANT:mailto:alex@wgs.bot
DESCRIPTION:https://teams.microsoft.com/l/meetup-join/19%3atest%40thread.v2/0?context=%7b%7d
END:VEVENT
END:VCALENDAR`
    );

    expect(setReject).toHaveBeenCalledWith("Inbound recipient does not match configured recorder email");
  });

  it("uses the envelope recipient for forwarded Teams invites", async () => {
    const setReject = vi.fn();
    const createWorkflow = vi.fn(async () => undefined);
    const env = {
      DB: new FakeD1() as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      MEETING_WORKFLOW: { create: createWorkflow }
    };

    await handleInvite(
      { from: "alice@wgs.bot", to: "notetaker@wgs.bot", setReject },
      env,
      `From: Alice <alice@wgs.bot>
To: Alice <alice@wgs.bot>

BEGIN:VCALENDAR
METHOD:REQUEST
BEGIN:VEVENT
UID:test-forward
SUMMARY:Forwarded Test
DTSTART:20260504T150000Z
DTEND:20260504T153000Z
ORGANIZER;CN=Alice:mailto:alice@wgs.bot
ATTENDEE;CN=Alex;ROLE=REQ-PARTICIPANT:mailto:alex@wgs.bot
DESCRIPTION:https://teams.microsoft.com/l/meetup-join/19%3atest%40thread.v2/0?context=%7b%7d
END:VEVENT
END:VCALENDAR`
    );

    expect(setReject).not.toHaveBeenCalled();
    expect(createWorkflow).toHaveBeenCalledWith(expect.objectContaining({ id: expect.stringMatching(/^meeting-/) }));
  });
});
