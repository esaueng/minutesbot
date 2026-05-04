import { createId, nowIso } from "@minutesbot/shared";
import type { EmailDeliveryRow } from "./schema";

export async function createEmailDelivery(db: D1Database, input: Omit<EmailDeliveryRow, "id" | "created_at">): Promise<EmailDeliveryRow> {
  const row: EmailDeliveryRow = { ...input, id: createId("eml"), created_at: nowIso() };
  await db
    .prepare(
      "INSERT INTO email_deliveries (id, meeting_id, recipient_email, type, status, provider_message_id, failure_reason, created_at, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      row.id,
      row.meeting_id,
      row.recipient_email,
      row.type,
      row.status,
      row.provider_message_id ?? null,
      row.failure_reason ?? null,
      row.created_at,
      row.sent_at ?? null
    )
    .run();
  return row;
}

export async function listEmailDeliveries(db: D1Database, meetingId: string): Promise<EmailDeliveryRow[]> {
  const result = await db.prepare("SELECT * FROM email_deliveries WHERE meeting_id = ? ORDER BY created_at DESC").bind(meetingId).all<EmailDeliveryRow>();
  return result.results ?? [];
}
