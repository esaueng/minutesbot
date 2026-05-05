import { describe, expect, it } from "vitest";
import { parseHash } from "./App";

describe("app routing", () => {
  it("treats the legacy settings hash as the setup screen", () => {
    expect(parseHash("#/settings")).toEqual({ name: "setup" });
  });
});
