import { AppError } from "@minutesbot/shared";
import type { Context, Next } from "hono";
import type { Env } from "../env";

export function createAuthMiddleware() {
  return async function authMiddleware(c: Pick<Context<{ Bindings: Env }>, "env" | "req">, next: Next): Promise<void> {
    const env = (c.env ?? {}) as Env;
    if (isPublicApiPath(c.req.path)) {
      await next();
      return;
    }

    if (!env.SESSION_SECRET) {
      throw new AppError("AUTH_NOT_CONFIGURED", "Configure SESSION_SECRET before exposing admin routes.", 503);
    }

    if (readBearerToken(c.req.raw) !== env.SESSION_SECRET) {
      throw new AppError("UNAUTHORIZED", "Enter the admin token to access minutesbot.", 401);
    }

    await next();
  };
}

export function isPublicApiPath(path: string): boolean {
  return path === "/api/health" || path === "/api/health/" || path === "/api/webhooks/attendee" || path === "/api/webhooks/attendee/";
}

export const adminTokenAuthMiddleware = createAuthMiddleware();

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(/\s+/, 2);
  if (scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
