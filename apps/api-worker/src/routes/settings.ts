import { Hono } from "hono";
import { createAuditLog } from "@minutesbot/db";
import type { Env } from "../env";
import { readSettings, writeSettings } from "../services/settingsService";

export const settingsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => c.json(await readSettings(c.env)))
  .put("/", async (c) => {
    const settings = await writeSettings(c.env, await c.req.json());
    await createAuditLog(c.env.DB, { eventType: "settings.changed", resourceType: "settings", resourceId: "app" });
    return c.json(settings);
  });
