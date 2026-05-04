import { Hono } from "hono";
import { listAuditLogs } from "@minutesbot/db";
import type { Env } from "../env";

export const auditLogsRoute = new Hono<{ Bindings: Env }>().get("/", async (c) =>
  c.json({
    auditLogs: await listAuditLogs(c.env.DB, {
      eventType: c.req.query("eventType"),
      resourceId: c.req.query("resourceId")
    })
  })
);
