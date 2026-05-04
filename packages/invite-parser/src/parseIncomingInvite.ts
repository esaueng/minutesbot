import { AppError } from "@minutesbot/shared";
import { extractTeamsJoinUrl } from "./extractTeamsJoinUrl";
import { parseIcsCalendar } from "./parseIcs";
import type { ParsedMeetingInvite } from "./types";

export function parseIncomingInvite(rawEmail: string): ParsedMeetingInvite {
  const headers = parseHeaders(rawEmail);
  const rawRecipient = firstAddress(headers.get("to") ?? headers.get("delivered-to") ?? "");
  const rawSender = firstAddress(headers.get("from") ?? headers.get("sender") ?? "");
  const body = rawEmail.slice(rawEmail.indexOf("\n\n") + 2);
  const calendarText = extractCalendarPart(rawEmail);

  if (!rawRecipient || !rawSender) {
    throw new AppError("INVITE_PARSE_ERROR", "Inbound email is missing sender or recipient", 400);
  }
  if (!calendarText) {
    throw new AppError("INVITE_PARSE_ERROR", "Inbound email does not include a calendar payload", 400);
  }

  const calendar = parseIcsCalendar(calendarText);
  const teamsJoinUrl = extractTeamsJoinUrl(`${calendar.description ?? ""}\n${calendar.location ?? ""}\n${body}`);
  if (!teamsJoinUrl) {
    throw new AppError("REJECTED_NO_TEAMS_LINK", "Meeting invite does not contain a Microsoft Teams join URL", 400);
  }

  return {
    ...calendar,
    teamsJoinUrl,
    rawRecipient: rawRecipient.toLowerCase(),
    rawSender: rawSender.toLowerCase()
  };
}

function parseHeaders(rawEmail: string): Map<string, string> {
  const headerText = rawEmail.split(/\r?\n\r?\n/, 1)[0] ?? "";
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
  const headers = new Map<string, string>();
  for (const line of unfolded.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    headers.set(line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim());
  }
  return headers;
}

function firstAddress(value: string): string {
  const angle = value.match(/<([^>]+)>/);
  const candidate = angle?.[1] ?? value.split(",")[0] ?? "";
  return candidate.trim().replace(/^mailto:/i, "");
}

function extractCalendarPart(rawEmail: string): string | null {
  const begin = rawEmail.indexOf("BEGIN:VCALENDAR");
  const end = rawEmail.indexOf("END:VCALENDAR");
  if (begin === -1 || end === -1) return null;
  return rawEmail.slice(begin, end + "END:VCALENDAR".length);
}
