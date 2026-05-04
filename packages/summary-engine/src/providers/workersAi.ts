import type { SummaryProvider } from "../types";

export function createWorkersAiProvider(): SummaryProvider {
  return {
    async generate(): Promise<unknown> {
      throw new Error("Workers AI summary provider is configured as a placeholder for this MVP");
    }
  };
}
