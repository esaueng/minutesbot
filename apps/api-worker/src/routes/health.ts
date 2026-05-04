import { Hono } from "hono";
import type { Env } from "../env";

export const healthRoute = new Hono<{ Bindings: Env }>().get("/", (c) => c.json({ ok: true }));
