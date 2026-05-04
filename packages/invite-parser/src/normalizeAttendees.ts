import type { NormalizedAttendee, RawIcsAttendee } from "./types";

export function normalizeAttendees(rawAttendees: RawIcsAttendee[]): NormalizedAttendee[] {
  return rawAttendees
    .map((attendee) => {
      const role = normalizeRole(attendee.role);
      return {
        email: attendee.email.trim().toLowerCase(),
        name: attendee.name?.trim(),
        role
      };
    })
    .filter((attendee) => attendee.email.includes("@"));
}

function normalizeRole(role?: string): "required" | "optional" | "resource" | undefined {
  const value = role?.toUpperCase();
  if (value === "REQ-PARTICIPANT" || value === "REQUIRED") return "required";
  if (value === "OPT-PARTICIPANT" || value === "OPTIONAL") return "optional";
  if (value === "NON-PARTICIPANT" || value === "RESOURCE") return "resource";
  return undefined;
}
