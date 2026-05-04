import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../lib/dates";

type Meeting = Record<string, string | number | null | undefined>;

export function MeetingTable({ meetings }: { meetings: Meeting[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Subject</th>
          <th>Organizer</th>
          <th>Status</th>
          <th>Bot</th>
          <th>Transcript</th>
          <th>Summary</th>
          <th>Eligible</th>
          <th>Latest error</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((meeting) => (
          <tr key={String(meeting.id)}>
            <td>{formatDate(String(meeting.start_time ?? ""))}</td>
            <td>{meeting.subject}</td>
            <td>{meeting.organizer_email}</td>
            <td><StatusBadge value={String(meeting.status ?? "")} /></td>
            <td>{meeting.attendee_bot_state ?? "not created"}</td>
            <td>{meeting.transcript_status ?? "not_started"}</td>
            <td>{meeting.summary_status ?? "not_started"}</td>
            <td>{meeting.eligible_recipient_count ?? 0}</td>
            <td>{meeting.latest_error ?? ""}</td>
            <td><a href={`#/meeting/${meeting.id}`}>Open</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
