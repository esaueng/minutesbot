import { createId, nowIso } from "@minutesbot/shared";
import type { ArtifactRow } from "./schema";

export async function createArtifact(db: D1Database, input: Omit<ArtifactRow, "id" | "created_at">): Promise<ArtifactRow> {
  const row: ArtifactRow = { ...input, id: createId("art"), created_at: nowIso() };
  await db
    .prepare("INSERT INTO artifacts (id, meeting_id, type, r2_key, content_type, size_bytes, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.meeting_id, row.type, row.r2_key, row.content_type ?? null, row.size_bytes ?? null, row.created_at, row.deleted_at ?? null)
    .run();
  return row;
}

export async function listArtifacts(db: D1Database, meetingId: string): Promise<ArtifactRow[]> {
  const result = await db.prepare("SELECT * FROM artifacts WHERE meeting_id = ? ORDER BY created_at DESC").bind(meetingId).all<ArtifactRow>();
  return result.results ?? [];
}

export async function markArtifactDeleted(db: D1Database, id: string): Promise<void> {
  await db.prepare("UPDATE artifacts SET deleted_at = ? WHERE id = ?").bind(nowIso(), id).run();
}
