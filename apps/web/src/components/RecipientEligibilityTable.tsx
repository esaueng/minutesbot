export function RecipientEligibilityTable({ attendees }: { attendees: Array<Record<string, unknown>> }) {
  return (
    <section>
      <h2>Attendees and eligibility</h2>
      <table>
        <thead><tr><th>Email</th><th>Name</th><th>Domain</th><th>Eligible</th><th>Exclusion</th></tr></thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={String(attendee.id ?? attendee.email)}>
              <td>{String(attendee.email)}</td>
              <td>{String(attendee.name ?? "")}</td>
              <td>{String(attendee.domain ?? "")}</td>
              <td>{attendee.summary_eligible ? "Yes" : "No"}</td>
              <td>{String(attendee.exclusion_reason ?? "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
