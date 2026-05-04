type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, event: string, metadata: Record<string, unknown> = {}): void {
  const sanitized = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !/secret|token|api[_-]?key|password/i.test(key))
  );
  console[level](JSON.stringify({ level, event, ...sanitized }));
}
