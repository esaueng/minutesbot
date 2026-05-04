export type Recipient = {
  email: string;
  name?: string;
  domain?: string;
};

export type ExclusionReason =
  | "excluded_invalid_email"
  | "excluded_external_domain"
  | "excluded_external_attendee_policy";

export type ExcludedRecipient = Recipient & {
  reason: ExclusionReason;
};

export type RecipientPolicy = {
  allowedDomains: string[];
  allowSubdomains: boolean;
  sendToExternalAttendees: false;
};
