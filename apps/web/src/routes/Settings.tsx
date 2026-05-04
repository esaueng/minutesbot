import { useEffect, useState } from "react";
import type { AppSettings } from "@minutesbot/shared";
import { SettingsForm } from "../components/SettingsForm";
import { appSettingsSchema } from "../lib/validation";
import { getSettings, saveSettings } from "../lib/api";

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    getSettings().then(setSettings).catch((error) => setStatus(error.message));
  }, []);

  if (!settings) return <p>{status || "Loading settings..."}</p>;
  const validation = appSettingsSchema.safeParse(settings);
  return (
    <div className="page">
      <header><h1>Settings</h1><p>Secret values are configured through Cloudflare secrets and are never displayed here.</p></header>
      <SettingsForm value={settings} onChange={setSettings} />
      {!validation.success && <pre className="errorBox">{JSON.stringify(validation.error.flatten(), null, 2)}</pre>}
      <div className="actions">
        <button disabled={!validation.success} onClick={async () => {
          try {
            setSettings(await saveSettings(settings));
            setStatus("Saved");
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Save failed");
          }
        }}>Save settings</button>
        <span>{status}</span>
      </div>
    </div>
  );
}
