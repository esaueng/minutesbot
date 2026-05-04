export function AuditLogTable({ logs }: { logs: Array<Record<string, unknown>> }) {
  return (
    <table>
      <thead><tr><th>Time</th><th>Event</th><th>Actor</th><th>Resource</th><th>Metadata</th></tr></thead>
      <tbody>
        {logs.map((log) => (
          <tr key={String(log.id)}>
            <td>{String(log.created_at)}</td>
            <td>{String(log.event_type)}</td>
            <td>{String(log.actor_email ?? "")}</td>
            <td>{String(log.resource_type ?? "")}/{String(log.resource_id ?? "")}</td>
            <td><code>{String(log.metadata ?? "")}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
