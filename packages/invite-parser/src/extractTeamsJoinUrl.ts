const teamsUrlPattern = /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"')]+/i;

function decodeIcsText(input: string): string {
  return input
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/&amp;/g, "&")
    .replace(/=3D/g, "=")
    .replace(/=\r?\n/g, "");
}

export function extractTeamsJoinUrl(input: string): string | null {
  const decoded = decodeIcsText(decodeURIComponentSafe(input));
  const match = decoded.match(teamsUrlPattern);
  return match ? match[0].replace(/[\\,;]+$/, "") : null;
}

function decodeURIComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}
