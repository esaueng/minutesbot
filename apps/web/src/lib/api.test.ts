import { afterEach, describe, expect, it, vi } from "vitest";
import { apiGet, setApiAuthTokenProvider } from "./api";

describe("web api client auth", () => {
  afterEach(() => {
    setApiAuthTokenProvider(null);
    vi.restoreAllMocks();
  });

  it("adds a Clerk bearer token when one is available", async () => {
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
});

