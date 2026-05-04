import { Hono } from "hono";
import { listArtifacts } from "@minutesbot/db";
import type { Env } from "../env";

export const artifactsRoute = new Hono<{ Bindings: Env }>().get("/:meetingId", async (c) =>
  c.json({ artifacts: await listArtifacts(c.env.DB, c.req.param("meetingId")) })
);
