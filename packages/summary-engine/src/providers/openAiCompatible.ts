import type { SummaryProvider } from "../types";

export type OpenAiCompatibleOptions = {
  baseUrl: string;
  apiKey: string;
  model: string;
  fetcher?: typeof fetch;
};

export function createOpenAiCompatibleProvider(options: OpenAiCompatibleOptions): SummaryProvider {
  const fetcher = options.fetcher ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  return {
    async generate(prompt: string): Promise<unknown> {
      const response = await fetcher(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${options.apiKey}`
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            { role: "system", content: "Return strict JSON meeting notes." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) throw new Error(`AI provider failed with ${response.status}`);
      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI provider returned no content");
      return JSON.parse(content);
    }
  };
}
