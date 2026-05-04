import type { MeetingSummary } from "@minutesbot/summary-engine";

export type SummaryEmailInput = {
  subject: string;
  date?: string;
  summary: MeetingSummary;
  excludedRecipients?: string[];
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};
