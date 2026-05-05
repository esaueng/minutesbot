import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { AttendeeStatus } from "./routes/AttendeeStatus";
import { Logs } from "./routes/Logs";
import { MeetingDetail } from "./routes/MeetingDetail";
import { Meetings } from "./routes/Meetings";
import { Setup } from "./routes/Setup";

export type RouteName = "setup" | "attendee" | "meetings" | "meeting" | "logs";

export function App() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <Layout route={route.name}>
      {route.name === "setup" && <Setup />}
      {route.name === "attendee" && <AttendeeStatus />}
      {route.name === "meetings" && <Meetings />}
      {route.name === "meeting" && <MeetingDetail id={route.id ?? ""} />}
      {route.name === "logs" && <Logs />}
    </Layout>
  );
}

export function parseHash(hashValue = window.location.hash): { name: RouteName; id?: string } {
  const hash = hashValue.replace(/^#\/?/, "");
  const [name, id] = hash.split("/");
  if (name === "settings") return { name: "setup" };
  if (name === "attendee" || name === "meetings" || name === "logs" || name === "setup") return { name };
  if (name === "meeting") return { name: "meeting", id };
  return { name: "setup" };
}
