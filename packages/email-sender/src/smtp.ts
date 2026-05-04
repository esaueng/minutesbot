import type { EmailProvider } from "./types";

export function createSmtpProvider(options: { endpoint: string; password?: string; fetcher?: typeof fetch }): EmailProvider {
  const fetcher = options.fetcher ?? fetch;
  return {
    async send(message) {
      const response = await fetcher(options.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.password ? { authorization: "Bearer redacted" } : {})
        },
        body: JSON.stringify(message)
      });
      if (!response.ok) return { status: "failed", failureReason: `SMTP provider failed with ${response.status}` };
      return { status: "sent" };
    }
  };
}
