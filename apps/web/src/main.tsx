import React from "react";
import { ClerkProvider } from "@clerk/react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthGate, MissingClerkConfig } from "./AuthGate";
import "./styles.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AuthGate>
          <App />
        </AuthGate>
      </ClerkProvider>
    ) : (
      <MissingClerkConfig />
    )}
  </React.StrictMode>
);
