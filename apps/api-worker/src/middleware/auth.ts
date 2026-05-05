import { createClerkClient } from "@clerk/backend";
import { AppError } from "@minutesbot/shared";
import type { Context, Next } from "hono";
import type { Env } from "../env";

type AuthResult = {
  isAuthenticated: boolean;
  userId: string | null;
};

type AuthDependencies = {
  authenticate(request: Request, env: Env): Promise<AuthResult>;
  getUserEmails(userId: string, env: Env): Promise<string[]>;
};

export function createAuthMiddleware(dependencies?: AuthDependencies) {
  const resolvedDependencies = dependencies ?? clerkDependencies;
  return async function authMiddleware(c: Pick<Context<{ Bindings: Env }>, "env" | "req">, next: Next): Promise<void> {
    const env = (c.env ?? {}) as Env;
    if (isPublicApiPath(c.req.path)) {
      await next();
      return;
    }

    const adminUserIds = parseAdminList(env.CLERK_ADMIN_USER_IDS);
    const adminEmails = parseAdminList(env.ADMIN_EMAILS);
    if (!adminUserIds.length && !adminEmails.length) {
      throw new AppError("AUTH_NOT_CONFIGURED", "Configure ADMIN_EMAILS or CLERK_ADMIN_USER_IDS before exposing admin routes.", 503);
    }

    const auth = await resolvedDependencies.authenticate(c.req.raw, env);
    if (!auth.isAuthenticated || !auth.userId) {
      throw new AppError("UNAUTHORIZED", "Sign in with Clerk to access minutesbot.", 401);
    }

    if (adminUserIds.includes(auth.userId.toLowerCase())) {
      await next();
      return;
    }

    const emails = (await resolvedDependencies.getUserEmails(auth.userId, env)).map((email) => email.toLowerCase());
    if (emails.some((email) => adminEmails.includes(email))) {
      await next();
      return;
    }

    throw new AppError("FORBIDDEN", "Your Clerk account is not allowed to administer minutesbot.", 403);
  };
}

export function isPublicApiPath(path: string): boolean {
  return path === "/api/health" || path === "/api/health/" || path === "/api/webhooks/attendee" || path === "/api/webhooks/attendee/";
}

export function parseAdminList(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const clerkDependencies: AuthDependencies = {
  async authenticate(request, env) {
    const client = createClerk(env);
    const result = await client.authenticateRequest(request, {
      authorizedParties: parseAuthorizedParties(env)
    });
    const auth = result.toAuth();
    return {
      isAuthenticated: Boolean(auth?.isAuthenticated),
      userId: auth?.userId ?? null
    };
  },
  async getUserEmails(userId, env) {
    const user = await createClerk(env).users.getUser(userId);
    return user.emailAddresses.map((email) => email.emailAddress).filter(Boolean);
  }
};

export const clerkAuthMiddleware = createAuthMiddleware();

function createClerk(env: Env) {
  if (!env.CLERK_SECRET_KEY) {
    throw new AppError("AUTH_NOT_CONFIGURED", "Configure CLERK_SECRET_KEY before exposing admin routes.", 503);
  }
  return createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY
  });
}

function parseAuthorizedParties(env: Env): string[] {
  const configured = parseAdminList(env.CLERK_AUTHORIZED_PARTIES);
  if (configured.length) return configured;
  return [env.APP_BASE_URL].filter(Boolean);
}
