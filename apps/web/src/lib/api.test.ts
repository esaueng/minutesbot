import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, setApiAuthTokenProvider } from "./api";

describe("web api client auth", () => {
  afterEach(() => {
    setApiAuthTokenProvider(null);
    vi.restoreAllMocks();
  });

  it("adds an admin bearer token when one is available", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    setApiAuthTokenProvider(async () => "session-token");

    await expect(apiGet<{ ok: boolean }>("/api/health")).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: "Bearer session-token"
        })
      })
    );
  });

  it("preserves API error status and code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "AUTH_NOT_CONFIGURED",
              message: "Configure SESSION_SECRET before exposing admin routes."
            }
          }),
          { status: 503 }
        )
      )
    );

    await expect(apiGet<{ ok: boolean }>("/api/settings")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      code: "AUTH_NOT_CONFIGURED",
      message: "Configure SESSION_SECRET before exposing admin routes."
    });
    await expect(apiGet<{ ok: boolean }>("/api/settings")).rejects.toBeInstanceOf(ApiError);
  });
});
