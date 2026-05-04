import { createCloudflareEmailServiceProvider } from "./cloudflareEmailService";
import { createMockEmailProvider } from "./mock";
import { createSmtpProvider } from "./smtp";
import type { EmailProvider } from "./types";

export function createEmailProvider(input: {
  provider: "cloudflare-email-service" | "smtp" | "mock";
  sendEmailBinding?: { send: (message: unknown) => Promise<unknown> };
  smtpEndpoint?: string;
  smtpPassword?: string;
}): EmailProvider {
  if (input.provider === "cloudflare-email-service" && input.sendEmailBinding) {
    return createCloudflareEmailServiceProvider(input.sendEmailBinding);
  }
  if (input.provider === "smtp" && input.smtpEndpoint) {
    return createSmtpProvider({ endpoint: input.smtpEndpoint, password: input.smtpPassword });
  }
  return createMockEmailProvider();
}
