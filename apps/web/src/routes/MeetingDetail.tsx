import { useEffect, useState } from "react";
import { AttendeeStatePanel } from "../components/AttendeeStatePanel";
import { RecipientEligibilityTable } from "../components/RecipientEligibilityTable";
import { StatusBadge } from "../components/StatusBadge";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import { formatDate } from "../lib/dates";

export function MeetingDetail({ id }: { id: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");
  const load = () => apiGet<Record<string, unknown>>(`/api/meetings/${id}`).then(setData).catch((error) => setMessage(error.message));
  useEffect(() => {
    void load();
  }, [id]);
  if (!data) return <p>{message || "Loading meeting..."}</p>;
  const meeting = data.meeting as Record<string, unknown>;
  return (
    <div className="page">
      <header>
        <h1>{String(meeting.subject ?? "Meeting")}</h1>
        <p>{formatDate(String(meeting.start_time ?? ""))} · <StatusBadge value={String(meeting.status ?? "")} /></p>
      </header>
      <section>
        <h2>Meeting metadata</h2>
        <div className="metricGrid">
          <Metric label="Organizer" value={String(meeting.organizer_email ?? "")} />
          <Metric label="Calendar UID" value={String(meeting.calendar_uid ?? "")} />
          <Metric label="Teams join URL" value={String(meeting.teams_join_url ?? "")} />
          <Metric label="Summary status" value={String(meeting.summary_status ?? "")} />
        </div>
      </section>
      <RecipientEligibilityTable attendees={(data.attendees as Array<Record<string, unknown>>) ?? []} />
      <AttendeeStatePanel meeting={meeting} />
      {meeting.latest_error ? (
        <section>
          <h2>Latest error</h2>
          <div className="errorPanel">{String(meeting.latest_error)}</div>
        </section>
      ) : null}
      <TableSection title="Transcript segments" rows={(data.transcriptSegments as Array<Record<string, unknown>>) ?? []} />
      <TableSection title="Artifacts" rows={(data.artifacts as Array<Record<string, unknown>>) ?? []} />
      <TableSection title="Webhook events" rows={(data.webhookEvents as Array<Record<string, unknown>>) ?? []} />
      <TableSection title="Email deliveries" rows={(data.emailDeliveries as Array<Record<string, unknown>>) ?? []} />
      <section>
        <h2>Controls</h2>
        <div className="actions">
          <Action label="Retry bot" run={() => apiPost(`/api/meetings/${id}/retry-bot`)} done={load} />
          <Action label="Fetch transcript" run={() => apiPost(`/api/meetings/${id}/fetch-transcript`)} done={load} />
          <Action label="Retry summary" run={() => apiPost(`/api/meetings/${id}/retry-summary`)} done={load} />
          <Action label="Delete artifacts" run={() => apiDelete(`/api/meetings/${id}/artifacts`)} done={load} />
          <Action label="Delete Attendee data" run={() => apiPost(`/api/meetings/${id}/delete-attendee-data`)} done={load} />
        </div>
        {message && <p>{message}</p>}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Action({ label, run, done }: { label: string; run: () => Promise<unknown>; done: () => void }) {
  return <button onClick={async () => { await run(); done(); }}>{label}</button>;
}

function TableSection({ title, rows }: { title: string; rows: Array<Record<string, unknown>> }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="scroll">
        <table>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                <td><pre>{JSON.stringify(row, null, 2)}</pre></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td>No records</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
