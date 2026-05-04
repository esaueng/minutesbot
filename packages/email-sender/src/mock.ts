import type { EmailMessage, EmailProvider } from "./types";

export function createMockEmailProvider(sent: EmailMessage[] = []): EmailProvider & { sent: EmailMessage[] } {
  return {
    sent,
    async send(message) {
      sent.push(message);
      return { status: "sent", providerMessageId: `mock-${sent.length}` };
    }
  };
}
