import { AttendeeClientError, retryableStatus } from "./errors";
import type { AttendeeBot, AttendeeClientOptions, AttendeeTranscriptSegment, CreateAttendeeBotInput } from "./types";

export class AttendeeClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetcher: typeof fetch;

  constructor(options: AttendeeClientOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.apiKey = options.apiKey;
    this.fetcher = options.fetcher ?? ((input, init) => globalThis.fetch(input, init));
  }

  async createBot(input: CreateAttendeeBotInput): Promise<AttendeeBot> {
    return this.request<AttendeeBot>("/api/v1/bots", {
      method: "POST",
      body: JSON.stringify({
        ...(input.rawOverrides ?? {}),
        meeting_url: input.meetingUrl,
        bot_name: input.botName,
        webhooks: input.webhooks,
        metadata: input.metadata
      })
    });
  }

  async getBot(botId: string): Promise<AttendeeBot> {
    return this.request<AttendeeBot>(`/api/v1/bots/${encodeURIComponent(botId)}`);
  }

  async getBotTranscript(botId: string): Promise<AttendeeTranscriptSegment[]> {
    return this.request<AttendeeTranscriptSegment[]>(`/api/v1/bots/${encodeURIComponent(botId)}/transcript`);
  }

  async deleteBotData(botId: string): Promise<void> {
    await this.request<unknown>(`/api/v1/bots/${encodeURIComponent(botId)}/delete_data`, { method: "POST" });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Token ${this.apiKey}`,
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const retryable = retryableStatus(response.status);
      throw new AttendeeClientError(`Attendee request failed with ${response.status}`, response.status, retryable, mapStatus(response.status));
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}

export function normalizeBaseUrl(baseUrl: string): string {
  return new URL(baseUrl).toString().replace(/\/+$/, "");
}

function mapStatus(status: number): string {
  if (status === 401 || status === 403) return "ATTENDEE_AUTH_FAILED";
  if (status === 404) return "ATTENDEE_NOT_FOUND";
  if (status === 409) return "ATTENDEE_CONFLICT";
  if (status === 429) return "ATTENDEE_RATE_LIMITED";
  if (status >= 500) return "ATTENDEE_UPSTREAM_ERROR";
  return "ATTENDEE_REQUEST_FAILED";
}
