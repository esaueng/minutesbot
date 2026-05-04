import { useEffect, useState } from "react";
import { AuditLogTable } from "../components/AuditLogTable";
import { apiGet } from "../lib/api";

export function Logs() {
  const [eventType, setEventType] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const load = () => {
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (resourceId) params.set("resourceId", resourceId);
    apiGet<{ auditLogs: Array<Record<string, unknown>> }>(`/api/admin/audit-logs?${params}`).then((data) => setLogs(data.auditLogs));
  };
  useEffect(load, []);
  return (
    <div className="page">
      <header><h1>Audit logs</h1><p>Critical invite, bot, transcript, summary, email, artifact, and cleanup events.</p></header>
      <div className="filters">
        <input placeholder="Event type" value={eventType} onChange={(event) => setEventType(event.target.value)} />
        <input placeholder="Resource ID" value={resourceId} onChange={(event) => setResourceId(event.target.value)} />
        <button onClick={load}>Filter</button>
      </div>
      <AuditLogTable logs={logs} />
    </div>
  );
}
