import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { AttendeeStatus } from "./routes/AttendeeStatus";
import { Logs } from "./routes/Logs";
import { MeetingDetail } from "./routes/MeetingDetail";
import { Meetings } from "./routes/Meetings";
import { Settings } from "./routes/Settings";
import { Setup } from "./routes/Setup";

export type RouteName = "setup" | "settings" | "attendee" | "meetings" | "meeting" | "logs";

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
      {route.name === "settings" && <Settings />}
      {route.name === "attendee" && <AttendeeStatus />}
      {route.name === "meetings" && <Meetings />}
      {route.name === "meeting" && <MeetingDetail id={route.id ?? ""} />}
      {route.name === "logs" && <Logs />}
    </Layout>
  );
}

function parseHash(): { name: RouteName; id?: string } {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [name, id] = hash.split("/");
  if (name === "settings" || name === "attendee" || name === "meetings" || name === "logs" || name === "setup") return { name };
  if (name === "meeting") return { name: "meeting", id };
  return { name: "setup" };
}
