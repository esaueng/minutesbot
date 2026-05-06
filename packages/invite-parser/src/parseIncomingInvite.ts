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
    return parseLinkOnlyInvite({ headers, body, rawRecipient, rawSender });
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

function parseLinkOnlyInvite(input: { headers: Map<string, string>; body: string; rawRecipient: string; rawSender: string }): ParsedMeetingInvite {
  const teamsJoinUrl = extractTeamsJoinUrl(input.body);
  if (!teamsJoinUrl) {
    throw new AppError("INVITE_PARSE_ERROR", "Inbound email does not include a calendar payload", 400);
  }

  const start = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    kind: "request",
    calendarUid: `teams-link-${stableHash(teamsJoinUrl)}`,
    subject: decodeMimeWords(input.headers.get("subject") ?? "").trim() || "Teams meeting",
    organizer: { email: input.rawSender.toLowerCase() },
    attendees: [],
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    teamsJoinUrl,
    rawRecipient: input.rawRecipient.toLowerCase(),
    rawSender: input.rawSender.toLowerCase()
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

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function decodeMimeWords(value: string): string {
  return value.replace(/=\?utf-8\?q\?([^?]+)\?=/gi, (_match, encoded: string) =>
    encoded.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_hexMatch, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
  );
}

function extractCalendarPart(rawEmail: string): string | null {
  const begin = rawEmail.indexOf("BEGIN:VCALENDAR");
  const end = rawEmail.indexOf("END:VCALENDAR");
  if (begin === -1 || end === -1) return null;
  return rawEmail.slice(begin, end + "END:VCALENDAR".length);
}
