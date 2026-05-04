import { getEmailDomain, isAllowedDomain } from "./allowedDomains";
import type { ExcludedRecipient, Recipient, RecipientPolicy } from "./types";

export function filterSummaryRecipients(
  attendees: Recipient[],
  policy: RecipientPolicy
): { included: Recipient[]; excluded: ExcludedRecipient[] } {
  const included: Recipient[] = [];
  const excluded: ExcludedRecipient[] = [];

  for (const attendee of attendees) {
    const email = attendee.email.trim().toLowerCase();
    const domain = getEmailDomain(email);
    if (!domain) {
      excluded.push({ ...attendee, email, reason: "excluded_invalid_email" });
      continue;
    }
    if (!isAllowedDomain(domain, policy.allowedDomains, policy.allowSubdomains)) {
      excluded.push({ ...attendee, email, domain, reason: "excluded_external_domain" });
      continue;
    }
    included.push({ ...attendee, email, domain });
  }

  return { included, excluded };
}
