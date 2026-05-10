import { useEffect, useState } from "react";
import { MeetingTable } from "../components/MeetingTable";
import { apiDelete, apiGet } from "../lib/api";

type Meeting = Record<string, string | number | null | undefined>;

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const loadMeetings = () =>
    apiGet<{ meetings: Meeting[] }>("/api/meetings")
      .then((data) => setMeetings(data.meetings))
      .catch((err) => setError(err.message));
  useEffect(() => {
    void loadMeetings();
  }, []);

  async function removeMeeting(meeting: Meeting) {
    const id = String(meeting.id ?? "");
    if (!id) return;
    const subject = String(meeting.subject ?? "this meeting");
    const confirmed = window.confirm(`Remove "${subject}" from meeting history? This deletes the meeting record and stored artifacts.`);
    if (!confirmed) return;
    setDeletingId(id);
    setError("");
    try {
      await apiDelete(`/api/meetings/${encodeURIComponent(id)}`);
      setMeetings((current) => current.filter((item) => String(item.id) !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove meeting");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <header><h1>Meetings</h1><p>All meeting records created from Teams calendar invites and forwarded Teams links.</p></header>
      {error && <p className="errorText">{error}</p>}
      <MeetingTable meetings={meetings} onRemoveMeeting={removeMeeting} deletingMeetingId={deletingId} />
    </div>
  );
}
