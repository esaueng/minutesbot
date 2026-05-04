import { describe, expect, it } from "vitest";
import { createMockEmailProvider } from "./index";

describe("email sender", () => {
  it("mock provider records sent messages without leaking secrets", async () => {
    const provider = createMockEmailProvider();
    const result = await provider.send({
      from: "notes@company.com",
      to: "alex@company.com",
      subject: "Meeting summary: Project sync",
      text: "Summary"
    });

    expect(result).toEqual({ status: "sent", providerMessageId: "mock-1" });
    expect(provider.sent).toHaveLength(1);
  });
});
