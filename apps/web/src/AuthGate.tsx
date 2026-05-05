import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { setApiAuthTokenProvider } from "./lib/api";

const ADMIN_TOKEN_STORAGE_KEY = "minutesbot.adminToken";

export function AuthGate({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "");
  const [draftToken, setDraftToken] = useState("");

  useEffect(() => {
    setApiAuthTokenProvider(async () => token || null);
    return () => setApiAuthTokenProvider(null);
  }, [token]);

  function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextToken = draftToken.trim();
    if (!nextToken) return;
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setDraftToken("");
  }

  function clearToken() {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    setToken("");
  }

  if (!token) {
    return (
      <div className="authPage">
        <form className="authPanel" onSubmit={saveToken}>
          <h1>minutesbot admin</h1>
          <label htmlFor="admin-token">Admin token</label>
          <input
            id="admin-token"
            type="password"
            value={draftToken}
            onChange={(event) => setDraftToken(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
          <button type="submit">Continue</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="userMenu">
        <button type="button" onClick={clearToken}>
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
