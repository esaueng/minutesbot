import { describe, expect, it } from "vitest";
import { chunkTranscript, summarizeTranscript } from "./index";

describe("summary engine", () => {
  it("chunks long transcripts", () => {
    expect(chunkTranscript("a".repeat(25), 10)).toHaveLength(3);
  });

  it("validates and returns strict summary JSON from a provider", async () => {
    const summary = await summarizeTranscript(
      {
        meetingSubject: "Project sync",
        attendees: [{ email: "alex@company.com" }],
        transcriptText: "Alice: We decided to launch Friday."
      },
      {
        async generate() {
          return {
            summary: ["Launch timing was discussed."],
            decisions: ["Launch Friday."],
            actionItems: [],
            openQuestions: [],
            risks: [],
            followUps: []
          };
        }
      }
    );

    expect(summary.decisions).toEqual(["Launch Friday."]);
    expect(summary.actionItems).toEqual([]);
  });
});
