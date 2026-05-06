import { describe, expect, it, vi } from "vitest";
import { handleInvite } from "./index";

class FakeD1 {
  meetings: unknown[][] = [];
  attendees: unknown[][] = [];
  auditEvents: unknown[][] = [];

  prepare(sql: string) {
    const db = this;
    return {
      values: [] as unknown[],
      bind() {
        this.values = Array.from(arguments);
        return this;
      },
      async first() {
        return null;
      },
      async run() {
        if (sql.includes("INSERT OR REPLACE INTO meetings")) db.meetings.push(this.values);
        if (sql.includes("INSERT INTO attendees")) db.attendees.push(this.values);
        if (sql.includes("INSERT INTO audit_logs")) db.auditEvents.push(this.values);
        return { success: true };
      },
      async all() {
        return { results: [] };
      }
    };
  }
}

describe("email worker invite handling", () => {
  it("accepts non-calendar test emails without an SMTP rejection", async () => {
    const setReject = vi.fn();
    const queueInvite = vi.fn(async () => undefined);
    const db = new FakeD1();
    const env = {
      DB: db as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      INVITE_QUEUE: { send: queueInvite }
    };

    await handleInvite(
      { from: "p.gustafson@wgsglobalservices.com", to: "notetaker@wgs.bot", setReject },
      env,
      `From: Peter <p.gustafson@wgsglobalservices.com>
To: notetaker@wgs.bot
Subject: TEST

hello`
    );

    expect(setReject).not.toHaveBeenCalled();
    expect(queueInvite).not.toHaveBeenCalled();
    expect(db.auditEvents.some((values) => values[2] === "invite.ignored")).toBe(true);
  });

  it("schedules link-only Teams emails immediately with the sender as recipient", async () => {
    const setReject = vi.fn();
    const queueInvite = vi.fn(async () => undefined);
    const db = new FakeD1();
    const env = {
      DB: db as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      INVITE_QUEUE: { send: queueInvite }
    };

    await handleInvite(
      { from: "p.gustafson@wgs.bot", to: "notetaker@wgs.bot", setReject },
      env,
      `From: Peter <p.gustafson@wgs.bot>
To: notetaker@wgs.bot
Subject: Join Teams meeting in progress

https://teams.microsoft.com/l/meetup-join/19%3alink%40thread.v2/0?context=%7b%7d`
    );

    expect(setReject).not.toHaveBeenCalled();
    expect(queueInvite).toHaveBeenCalledWith(expect.objectContaining({ type: "create_bot", meetingId: expect.stringMatching(/^mtg_/) }));
    expect(db.meetings[0][2]).toBe("Join Teams meeting in progress");
    expect(db.meetings[0][3]).toBe("p.gustafson@wgs.bot");
    expect(db.attendees[0][2]).toBe("p.gustafson@wgs.bot");
    expect(db.attendees[0][6]).toBe(1);
  });

  it("rejects wrong recorder recipient", async () => {
    const setReject = vi.fn();
    const env = {
      DB: new FakeD1() as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      INVITE_QUEUE: { send: vi.fn(async () => undefined) }
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
    const queueInvite = vi.fn(async () => undefined);
    const env = {
      DB: new FakeD1() as unknown as D1Database,
      ARTIFACTS: { put: vi.fn(async () => undefined) } as unknown as R2Bucket,
      INVITE_QUEUE: { send: queueInvite }
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
    expect(queueInvite).toHaveBeenCalledWith(expect.objectContaining({ type: "create_bot", meetingId: expect.stringMatching(/^mtg_/) }));
  });
});
