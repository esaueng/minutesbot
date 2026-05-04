import { chunkTranscript } from "./chunkTranscript";
import { buildSummaryPrompt } from "./promptTemplates";
import { meetingSummarySchema, type MeetingSummary, type SummaryInput, type SummaryProvider } from "./types";

export async function summarizeTranscript(input: SummaryInput, provider: SummaryProvider): Promise<MeetingSummary> {
  const chunks = chunkTranscript(input.transcriptText);
  const partials: MeetingSummary[] = [];
  for (const chunk of chunks) {
    const result = await provider.generate(buildSummaryPrompt({ ...input, transcriptText: chunk }));
    partials.push(meetingSummarySchema.parse(result));
  }
  return combineSummaries(partials);
}

function combineSummaries(summaries: MeetingSummary[]): MeetingSummary {
  return {
    summary: summaries.flatMap((summary) => summary.summary),
    decisions: summaries.flatMap((summary) => summary.decisions),
    actionItems: summaries.flatMap((summary) => summary.actionItems),
    openQuestions: summaries.flatMap((summary) => summary.openQuestions),
    risks: summaries.flatMap((summary) => summary.risks),
    followUps: summaries.flatMap((summary) => summary.followUps)
  };
}
