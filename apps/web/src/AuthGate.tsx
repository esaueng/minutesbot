import { Show, SignIn, UserButton, useAuth } from "@clerk/react";
import { useEffect, type ReactNode } from "react";
import { setApiAuthTokenProvider } from "./lib/api";

export function AuthGate({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setApiAuthTokenProvider(() => getToken());
    return () => setApiAuthTokenProvider(null);
  }, [getToken]);

  return (
    <>
      <Show when="signed-out">
        <div className="authPage">
          <div className="authPanel">
            <h1>minutesbot admin</h1>
            <SignIn routing="hash" />
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="userMenu">
          <UserButton />
        </div>
        {children}
      </Show>
    </>
  );
}

export function MissingClerkConfig() {
  return (
    <div className="authPage">
      <div className="authPanel">
        <h1>Clerk is not configured</h1>
        <p>Set VITE_CLERK_PUBLISHABLE_KEY in Vercel before exposing the admin console.</p>
      </div>
    </div>
  );
}
