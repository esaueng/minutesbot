import { StatusBadge } from "./StatusBadge";

export function AttendeeStatePanel({ meeting }: { meeting: Record<string, unknown> }) {
  return (
    <section>
      <h2>Attendee bot state</h2>
      <div className="metricGrid">
        <Metric label="Bot ID" value={String(meeting.attendee_bot_id ?? "Not created")} />
        <Metric label="State" value={<StatusBadge value={String(meeting.attendee_bot_state ?? "unknown")} />} />
        <Metric label="Transcription" value={String(meeting.attendee_transcription_state ?? "unknown")} />
        <Metric label="Recording" value={String(meeting.attendee_recording_state ?? "unknown")} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}
