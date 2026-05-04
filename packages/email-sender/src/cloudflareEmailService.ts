import type { EmailMessage, EmailProvider } from "./types";

export function createCloudflareEmailServiceProvider(binding: { send: (message: unknown) => Promise<unknown> }): EmailProvider {
  return {
    async send(message: EmailMessage) {
      const result = await binding.send(message);
      return { status: "sent", providerMessageId: extractMessageId(result) };
    }
  };
}

function extractMessageId(result: unknown): string | undefined {
  if (typeof result === "object" && result && "id" in result) return String((result as { id: unknown }).id);
  return undefined;
}
