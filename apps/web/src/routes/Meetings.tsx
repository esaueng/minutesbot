import { useEffect, useState } from "react";
import { MeetingTable } from "../components/MeetingTable";
import { apiGet } from "../lib/api";

export function Meetings() {
  const [meetings, setMeetings] = useState<Array<Record<string, string | number | null | undefined>>>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    apiGet<{ meetings: Array<Record<string, string | number | null | undefined>> }>("/api/meetings")
      .then((data) => setMeetings(data.meetings))
      .catch((err) => setError(err.message));
  }, []);
  return (
    <div className="page">
      <header><h1>Meetings</h1><p>Meeting records created from Teams calendar invites.</p></header>
      {error ? <p className="errorText">{error}</p> : <MeetingTable meetings={meetings} />}
    </div>
  );
}
