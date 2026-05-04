export class AttendeeClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
    public readonly code: string
  ) {
    super(message);
  }
}

export function retryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}
