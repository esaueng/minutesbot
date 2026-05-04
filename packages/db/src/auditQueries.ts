import { createId, nowIso, type AuditEventType } from "@minutesbot/shared";
import type { AuditLogRow } from "./schema";

export async function createAuditLog(
  db: D1Database,
  input: {
    actorEmail?: string;
    eventType: AuditEventType | string;
    resourceType?: string;
    resourceId?: string;
    metadata?: unknown;
  }
): Promise<AuditLogRow> {
  const row: AuditLogRow = {
    id: createId("aud"),
    actor_email: input.actorEmail ?? null,
    event_type: input.eventType,
    resource_type: input.resourceType ?? null,
    resource_id: input.resourceId ?? null,
    metadata: input.metadata === undefined ? null : JSON.stringify(input.metadata),
    created_at: nowIso()
  };
  await db
    .prepare(
      "INSERT INTO audit_logs (id, actor_email, event_type, resource_type, resource_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(row.id, row.actor_email, row.event_type, row.resource_type, row.resource_id, row.metadata, row.created_at)
    .run();
  return row;
}

export async function listAuditLogs(db: D1Database, filters: { eventType?: string; resourceId?: string } = {}): Promise<AuditLogRow[]> {
  if (filters.eventType) {
    const result = await db.prepare("SELECT * FROM audit_logs WHERE event_type = ? ORDER BY created_at DESC LIMIT 200").bind(filters.eventType).all<AuditLogRow>();
    return result.results ?? [];
  }
  if (filters.resourceId) {
    const result = await db.prepare("SELECT * FROM audit_logs WHERE resource_id = ? ORDER BY created_at DESC LIMIT 200").bind(filters.resourceId).all<AuditLogRow>();
    return result.results ?? [];
  }
  const result = await db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200").all<AuditLogRow>();
  return result.results ?? [];
}
