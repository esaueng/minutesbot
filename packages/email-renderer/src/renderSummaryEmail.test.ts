import { describe, expect, it } from "vitest";
import { renderFailureEmail, renderSummaryEmail } from "./index";

describe("email renderer", () => {
  it("renders summary text and html snapshots", () => {
    const rendered = renderSummaryEmail({
      subject: "Project sync",
      summary: {
        summary: ["Discussed launch."],
        decisions: [],
        actionItems: [{ owner: "Alex", task: "Ship release notes" }],
        openQuestions: [],
        risks: [],
        followUps: []
      },
      excludedRecipients: ["vendor@example.com"]
    });

    expect(rendered.subject).toBe("Meeting summary: Project sync");
    expect(rendered.text).toMatchInlineSnapshot(`
      "Meeting
      Project sync
      Summary
      - Discussed launch.

      Decisions
      - None

      Action items
      - Alex - Ship release notes

      Open questions
      - None

      Risks
      - None

      Follow-ups
      - None

      Not sent to external attendees
      - vendor@example.com
      "
    `);
    expect(rendered.html).toContain("<li>vendor@example.com</li>");
  });

  it("renders organizer-only failure notices", () => {
    expect(renderFailureEmail({ subject: "Project sync" }).subject).toBe("Notes unavailable: Project sync");
  });
});
