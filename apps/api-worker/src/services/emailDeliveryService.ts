import { createEmailDelivery } from "@minutesbot/db";
import { createEmailProvider } from "@minutesbot/email-sender";
import type { RenderedEmail } from "@minutesbot/email-renderer";
import type { Env } from "../env";

export async function sendTrackedEmail(
  env: Env,
  input: { meetingId: string; from: string; to: string; type: string; email: RenderedEmail }
): Promise<void> {
  const provider = createEmailProvider({ provider: "mock", sendEmailBinding: env.SEND_EMAIL });
  const result = await provider.send({ from: input.from, to: input.to, ...input.email });
  await createEmailDelivery(env.DB, {
    meeting_id: input.meetingId,
    recipient_email: input.to,
    type: input.type,
    status: result.status,
    provider_message_id: result.providerMessageId ?? null,
    failure_reason: result.failureReason ?? null,
    sent_at: result.status === "sent" ? new Date().toISOString() : null
  });
}
