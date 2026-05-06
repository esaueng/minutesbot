import { useEffect, useState } from "react";
import type { AppSettings } from "@minutesbot/shared";
import { SettingsForm } from "../components/SettingsForm";
import { TestActionButton } from "../components/TestActionButton";
import { ApiError, getSettings, saveSettings, uploadBotImage } from "../lib/api";

export function Setup() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [authNotConfigured, setAuthNotConfigured] = useState(false);
  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((error) => {
        if (error instanceof ApiError && error.code === "AUTH_NOT_CONFIGURED") {
          setAuthNotConfigured(true);
        }
        setMessage(error instanceof Error ? error.message : "Failed to load setup.");
      });
  }, []);

  if (authNotConfigured) {
    return (
      <div className="page">
        <header>
          <h1>Setup blocked</h1>
          <p>Configure the admin session secret before using protected setup routes.</p>
        </header>
        <section className="noticePanel">
          <h2>SESSION_SECRET is missing</h2>
          <p>{message}</p>
          <pre>wrangler secret put SESSION_SECRET</pre>
          <p>After setting the secret, deploy or restart the Worker and sign in with the same value as the admin token.</p>
        </section>
      </div>
    );
  }

  if (!settings) return <p>{message || "Loading setup..."}</p>;
  return (
    <div className="page">
      <header>
        <h1>Setup</h1>
        <p>Configure the single-tenant control plane, Attendee connection, AI provider, email provider, policy, and retention.</p>
      </header>
      <SettingsForm
        value={settings}
        onBotImageUpload={async (file) => {
          setMessage("Uploading bot image...");
          const uploaded = await uploadBotImage(await fileToBotImageUpload(file));
          setSettings(uploaded);
          setMessage("Bot image uploaded");
        }}
        onChange={setSettings}
      />
      <div className="actions">
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            setMessage("Saving...");
            const result = await saveSetupSettings(settings);
            setSettings(result.settings);
            setMessage(result.message);
            setSaving(false);
          }}
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {message && <span>{message}</span>}
      </div>
      <section>
        <h2>Test actions</h2>
        <div className="actionGrid">
          <TestActionButton path="/api/admin/test-d1" label="Test D1" />
          <TestActionButton path="/api/admin/test-r2" label="Test R2" />
          <TestActionButton path="/api/admin/test-attendee" label="Test Attendee connection" />
          <TestActionButton path="/api/admin/test-ai" label="Test AI connection" />
          <TestActionButton path="/api/admin/test-email" label="Test outbound email" />
          <TestActionButton path="/api/admin/parse-sample-invite" label="Parse sample invite" />
          <TestActionButton path="/api/admin/send-test-summary-email" label="Send test summary email" />
        </div>
      </section>
    </div>
  );
}

export async function fileToBotImageUpload(file: File): Promise<{ contentType: string; data: string; fileName: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    contentType: file.type,
    data: btoa(binary),
    fileName: file.name
  };
}

export async function saveSetupSettings(
  settings: AppSettings,
  save: (settings: AppSettings) => Promise<AppSettings> = saveSettings
): Promise<{ settings: AppSettings; message: string }> {
  try {
    return { settings: await save(settings), message: "Saved" };
  } catch (error) {
    return {
      settings,
      message: error instanceof Error ? error.message : "Save failed"
    };
  }
}
