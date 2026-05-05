import { Hono } from "hono";
import { app as apiApp } from "../apps/api-worker/src/index";
import { createVercelEnv } from "../apps/api-worker/src/vercelEnv";

const app = new Hono();

app.all("*", (c) => apiApp.fetch(c.req.raw, createVercelEnv(process.env)));

export default app;
