import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { BOT_WEBHOOK_TRIGGERS, verifyBotWebhookSignature } from "@minutesbot/bot-client";
import { AppError } from "@minutesbot/shared";
import type { Env } from "../env";
import { processBotWebhook } from "../services/meetingService";

const payloadSchema = z.object({
  idempotency_key: z.string().optional(),
  bot_id: z.string(),
  bot_metadata: z.object({ minutesbot_meeting_id: z.string().optional(), calendar_uid: z.string().optional() }).optional(),
  trigger: z.enum(BOT_WEBHOOK_TRIGGERS),
  data: z.record(z.unknown())
});

async function handleBotWebhook(c: Context<{ Bindings: Env }>) {
  const rawBody = await c.req.text();
  if (c.env.BOT_WEBHOOK_SECRET) {
    const valid = await verifyBotWebhookSignature({
      rawBody,
      webhookSecretBase64: c.env.BOT_WEBHOOK_SECRET,
      signature: c.req.header("x-webhook-signature") ?? null
    });
    if (!valid) throw new AppError("INVALID_WEBHOOK_SIGNATURE", "Invalid meeting bot webhook signature", 401);
  }
  const payload = payloadSchema.parse(JSON.parse(rawBody));
  return c.json({ ok: true, ...(await processBotWebhook(c.env, payload)) });
}

export const botWebhookRoute = new Hono<{ Bindings: Env }>().post("/", handleBotWebhook).post("", handleBotWebhook);
