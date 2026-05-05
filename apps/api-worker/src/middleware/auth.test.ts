import { describe, expect, it, vi } from "vitest";
import { AppError } from "@minutesbot/shared";
import { createAuthMiddleware, isPublicApiPath, parseAdminList } from "./auth";

describe("auth middleware", () => {
  it("leaves health and attendee webhook routes public", () => {
    expect(isPublicApiPath("/api/health")).toBe(true);
    expect(isPublicApiPath("/api/webhooks/attendee")).toBe(true);
    expect(isPublicApiPath("/api/settings")).toBe(false);
  });

  it("normalizes comma-separated admin allowlists", () => {
    expect(parseAdminList(" admin@example.com,Second@Example.com ,,")).toEqual(["admin@example.com", "second@example.com"]);
  });

  it("allows an authenticated admin email", async () => {
    const next = vi.fn();
    const middleware = createAuthMiddleware({
      authenticate: async () => ({ isAuthenticated: true, userId: "user_1" }),
      getUserEmails: async () => ["admin@example.com"]
    });

    await middleware(
      ({
        req: { path: "/api/settings", raw: new Request("https://app.example.com/api/settings") },
        env: { ADMIN_EMAILS: "admin@example.com", APP_BASE_URL: "https://app.example.com" }
      } as any),
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it("allows an authenticated admin user id", async () => {
    const next = vi.fn();
    const middleware = createAuthMiddleware({
      authenticate: async () => ({ isAuthenticated: true, userId: "user_1" }),
      getUserEmails: async () => []
    });

    await middleware(
      ({
        req: { path: "/api/settings", raw: new Request("https://app.example.com/api/settings") },
        env: { CLERK_ADMIN_USER_IDS: "user_1", APP_BASE_URL: "https://app.example.com" }
      } as any),
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects unauthenticated requests to protected routes", async () => {
    const middleware = createAuthMiddleware({
      authenticate: async () => ({ isAuthenticated: false, userId: null }),
      getUserEmails: async () => []
    });

    await expect(
      middleware(
        ({
          req: { path: "/api/settings", raw: new Request("https://app.example.com/api/settings") },
          env: { ADMIN_EMAILS: "admin@example.com", APP_BASE_URL: "https://app.example.com" }
        } as any),
        vi.fn()
      )
    ).rejects.toMatchObject(new AppError("UNAUTHORIZED", "Sign in with Clerk to access minutesbot.", 401));
  });

  it("rejects authenticated non-admin users", async () => {
    const middleware = createAuthMiddleware({
      authenticate: async () => ({ isAuthenticated: true, userId: "user_2" }),
      getUserEmails: async () => ["viewer@example.com"]
    });

    await expect(
      middleware(
        ({
          req: { path: "/api/settings", raw: new Request("https://app.example.com/api/settings") },
          env: { ADMIN_EMAILS: "admin@example.com", APP_BASE_URL: "https://app.example.com" }
        } as any),
        vi.fn()
      )
    ).rejects.toMatchObject(new AppError("FORBIDDEN", "Your Clerk account is not allowed to administer minutesbot.", 403));
  });
});
