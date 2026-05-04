import { describe, expect, it } from "vitest";
import { filterSummaryRecipients, getEmailDomain, isAllowedDomain, normalizeDomain } from "./index";

describe("recipient policy", () => {
  it("normalizes domains and extracts email domains", () => {
    expect(normalizeDomain(" AcMe.CoM. ")).toBe("acme.com");
    expect(getEmailDomain("aLEX@AcMe.CoM")).toBe("acme.com");
    expect(getEmailDomain("invalid-email")).toBeNull();
  });

  it("allows exact domains by default and optional subdomains", () => {
    expect(isAllowedDomain("acme.com", ["acme.com"], false)).toBe(true);
    expect(isAllowedDomain("eng.acme.com", ["acme.com"], false)).toBe(false);
    expect(isAllowedDomain("eng.acme.com", ["acme.com"], true)).toBe(true);
  });

  it("filters recipients with explicit exclusion reasons", () => {
    const result = filterSummaryRecipients(
      [
        { email: "alex@acme.com" },
        { email: "aLEX@AcMe.CoM" },
        { email: "vendor@gmail.com" },
        { email: "person@eng.acme.com" },
        { email: "invalid-email" }
      ],
      { allowedDomains: ["acme.com"], allowSubdomains: false, sendToExternalAttendees: false }
    );

    expect(result.included.map((recipient) => recipient.email)).toEqual(["alex@acme.com", "alex@acme.com"]);
    expect(result.excluded).toEqual([
      { email: "vendor@gmail.com", domain: "gmail.com", reason: "excluded_external_domain" },
      { email: "person@eng.acme.com", domain: "eng.acme.com", reason: "excluded_external_domain" },
      { email: "invalid-email", reason: "excluded_invalid_email" }
    ]);
  });
});
