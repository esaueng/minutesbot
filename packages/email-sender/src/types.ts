export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailSendResult = {
  status: "sent" | "failed";
  providerMessageId?: string;
  failureReason?: string;
};

export type EmailProvider = {
  send(message: EmailMessage): Promise<EmailSendResult>;
};
