import { useEffect, useState } from "react";
import type { AppSettings } from "@minutesbot/shared";
import { SettingsForm } from "../components/SettingsForm";
import { TestActionButton } from "../components/TestActionButton";
import { getSettings, saveSettings } from "../lib/api";

export function Setup() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    getSettings().then(setSettings).catch((error) => setMessage(error.message));
  }, []);

  if (!settings) return <p>{message || "Loading setup..."}</p>;
  return (
    <div className="page">
      <header>
        <h1>Setup</h1>
        <p>Configure the single-tenant control plane, Attendee connection, AI provider, email provider, policy, and retention.</p>
      </header>
      <SettingsForm value={settings} onChange={setSettings} />
      <div className="actions">
        <button onClick={async () => setSettings(await saveSettings(settings))}>Save settings</button>
        {message && <span>{message}</span>}
      </div>
      <section>
        <h2>Test actions</h2>
        <div className="actionGrid">
          <TestActionButton path="/api/admin/test-d1" label="Test D1" />
          <TestActionButton path="/api/admin/test-r2" label="Test R2" />
          <TestActionButton path="/api/admin/test-attendee" label="Test Attendee connection" />
          <TestActionButton path="/api/admin/test-email" label="Test outbound email" />
          <TestActionButton path="/api/admin/parse-sample-invite" label="Parse sample invite" />
          <TestActionButton path="/api/admin/send-test-summary-email" label="Send test summary email" />
        </div>
      </section>
    </div>
  );
}
