import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { TestActionButton } from "../components/TestActionButton";

export function AttendeeStatus() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    apiGet<Record<string, unknown>>("/api/admin/status").then(setStatus).catch((error) => setStatus({ ok: false, error: error.message }));
  }, []);
  const attendee = (status?.attendee ?? {}) as Record<string, unknown>;
  return (
    <div className="page">
      <header><h1>Attendee status</h1><p>Attendee is deployed separately and performs the actual Teams bot recording/transcription work.</p></header>
      <div className="metricGrid">
        <div className="metric"><span>Connection</span><strong><StatusBadge value={status?.ok ? "ready" : "not_tested"} /></strong></div>
        <div className="metric"><span>Base URL</span><strong>{String(attendee.baseUrl ?? "")}</strong></div>
        <div className="metric"><span>API key</span><strong>{attendee.apiKeyConfigured ? "Configured" : "Missing"}</strong></div>
        <div className="metric"><span>Webhook secret</span><strong>{attendee.webhookSecretConfigured ? "Configured" : "Missing"}</strong></div>
      </div>
      <section>
        <h2>Webhook URL</h2>
        <pre>{String(status?.webhookUrl ?? "")}</pre>
      </section>
      <section>
        <h2>Attendee setup copy block</h2>
        <pre>{`ATTENDEE_API_BASE_URL=https://attendee.company.com
wrangler secret put ATTENDEE_API_KEY
wrangler secret put ATTENDEE_WEBHOOK_SECRET`}</pre>
      </section>
      <TestActionButton path="/api/admin/test-attendee" label="Test Attendee auth" />
    </div>
  );
}
