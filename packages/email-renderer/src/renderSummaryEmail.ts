import type { RenderedEmail, SummaryEmailInput } from "./types";

export function renderSummaryEmail(input: SummaryEmailInput): RenderedEmail {
  const text = [
    "Meeting",
    input.subject,
    input.date ?? "",
    "",
    sectionText("Summary", input.summary.summary),
    sectionText("Decisions", input.summary.decisions),
    sectionText("Action items", input.summary.actionItems.map((item) => [item.owner, item.task, item.dueDate].filter(Boolean).join(" - "))),
    sectionText("Open questions", input.summary.openQuestions),
    sectionText("Risks", input.summary.risks),
    sectionText("Follow-ups", input.summary.followUps),
    sectionText("Not sent to external attendees", input.excludedRecipients ?? [])
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<main>${heading("Meeting")}${paragraph(input.subject)}${input.date ? paragraph(input.date) : ""}${sectionHtml("Summary", input.summary.summary)}${sectionHtml("Decisions", input.summary.decisions)}${sectionHtml("Action items", input.summary.actionItems.map((item) => [item.owner, item.task, item.dueDate].filter(Boolean).join(" - ")))}${sectionHtml("Open questions", input.summary.openQuestions)}${sectionHtml("Risks", input.summary.risks)}${sectionHtml("Follow-ups", input.summary.followUps)}${sectionHtml("Not sent to external attendees", input.excludedRecipients ?? [])}</main>`;
  return { subject: `Meeting summary: ${input.subject}`, text, html };
}

function sectionText(title: string, items: string[]): string {
  if (items.length === 0) return `${title}\n- None\n`;
  return `${title}\n${items.map((item) => `- ${item}`).join("\n")}\n`;
}

function sectionHtml(title: string, items: string[]): string {
  const listItems = (items.length ? items : ["None"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `${heading(title)}<ul>${listItems}</ul>`;
}

function heading(value: string): string {
  return `<h2>${escapeHtml(value)}</h2>`;
}

function paragraph(value: string): string {
  return `<p>${escapeHtml(value)}</p>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
