import { describe, expect, it } from "vitest";
import { normalizeSummaryForDisplay, summarizeArtifacts } from "./MeetingDetail";

describe("meeting artifact summaries", () => {
  it("groups repeated artifact rows and keeps the latest timestamp", () => {
    expect(
      summarizeArtifacts([
        {
          id: "art_1",
          type: "recording",
          r2_key: "recordings/mtg_1/recording.bin",
          content_type: "application/json",
          size_bytes: 412,
          created_at: "2026-05-06T03:52:30.261Z"
        },
        {
          id: "art_2",
          type: "recording",
          r2_key: "recordings/mtg_1/recording.bin",
          content_type: "application/json",
          size_bytes: 412,
          created_at: "2026-05-06T03:52:31.691Z"
        },
        {
          id: "art_3",
          type: "transcript_text",
          r2_key: "transcripts/mtg_1/transcript.txt",
          content_type: "text/plain",
          size_bytes: 28,
          created_at: "2026-05-06T03:53:00.000Z"
        }
      ])
    ).toEqual([
      {
        key: "transcript_text|transcripts/mtg_1/transcript.txt|text/plain|28|active",
        type: "transcript_text",
        path: "transcripts/mtg_1/transcript.txt",
        contentType: "text/plain",
        sizeBytes: 28,
        latestCreatedAt: "2026-05-06T03:53:00.000Z",
        count: 1,
        deleted: false
      },
      {
        key: "recording|recordings/mtg_1/recording.bin|application/json|412|active",
        type: "recording",
        path: "recordings/mtg_1/recording.bin",
        contentType: "application/json",
        sizeBytes: 412,
        latestCreatedAt: "2026-05-06T03:52:31.691Z",
        count: 2,
        deleted: false
      }
    ]);
  });
});

describe("meeting detail recap display", () => {
  it("normalizes teams-style summary JSON for display", () => {
    const summary = normalizeSummaryForDisplay(
      JSON.stringify({
        meetingType: "weekly_spqrc",
        meetingNotes: [
          {
            heading: "Safety Updates:",
            overview: "Safety was reviewed.",
            items: [{ title: "Incident Review:", detail: "Jenny reviewed safety incidents and corrective actions." }]
          }
        ],
        followUpTasks: [{ title: "Close Corrective Actions:", description: "Close open corrective actions.", owners: ["Jenny"], dueDate: "TBD" }],
        summary: [],
        decisions: [],
        actionItems: [],
        openQuestions: [],
        risks: [],
        followUps: []
      })
    );

    expect(summary?.meetingTypeLabel).toBe("Weekly SPQRC");
    expect(summary?.meetingNotes[0].items[0].title).toBe("Incident Review:");
    expect(summary?.followUpTasks[0].owners).toEqual(["Jenny"]);
  });

  it("normalizes legacy summary JSON without teams-style fields", () => {
    const summary = normalizeSummaryForDisplay(
      JSON.stringify({
        summary: ["Discussed launch."],
        decisions: [],
        actionItems: [{ owner: "Alex", task: "Ship release notes.", dueDate: "TBD" }],
        openQuestions: [],
        risks: [],
        followUps: []
      })
    );

    expect(summary?.meetingTypeLabel).toBe("General");
    expect(summary?.legacySections[0]).toEqual({ title: "Summary", items: ["Discussed launch."] });
    expect(summary?.legacySections[1]).toEqual({ title: "Action items", items: ["Alex - Ship release notes. - TBD"] });
  });
});
