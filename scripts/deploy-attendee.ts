import { fileURLToPath } from "node:url";
import { runWrangler, type RunCommand } from "./ensure-cloudflare-resources";

type DeployAttendeeOptions = {
  environment?: "production" | "staging";
  runCommand?: RunCommand;
  fetchHealth?: typeof fetch;
  log?: (message: string) => void;
  error?: (message: string) => void;
};

type VerifyAttendeeHealthOptions = {
  baseUrl: string;
  fetchHealth?: typeof fetch;
  log?: (message: string) => void;
  error?: (message: string) => void;
};

const ATTENDEE_CONFIG_PATH = "deploy/attendee-container/wrangler.jsonc";

export async function deployAttendee(options: DeployAttendeeOptions = {}): Promise<void> {
  const environment = options.environment ?? "production";
  const runCommand = options.runCommand ?? runWrangler;
  const log = options.log ?? console.log;
  const error = options.error ?? console.error;
  const args = ["deploy", "--config", ATTENDEE_CONFIG_PATH];
  if (environment === "staging") args.push("--env", "staging");

  await runCommand("wrangler", args);
  await verifyAttendeeHealth({
    baseUrl: attendeeBaseUrl(environment),
    fetchHealth: options.fetchHealth,
    log,
    error
  });
}

export async function verifyAttendeeHealth(options: VerifyAttendeeHealthOptions): Promise<void> {
  const fetchHealth = options.fetchHealth ?? fetch;
  const log = options.log ?? console.log;
  const error = options.error ?? console.error;
  const url = `${options.baseUrl.replace(/\/+$/, "")}/_ops/health`;

  let response: Response;
  try {
    response = await fetchHealth(url);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    error(`Attendee health check failed for ${url}: ${message}`);
    error("Confirm the Attendee Worker route/custom domain exists and DNS resolves before retrying bot creation.");
    throw new Error(`Attendee health check failed for ${url}: ${message}`);
  }

  const body = await response.text();
  if (!response.ok) {
    error(`Attendee health check returned ${response.status} for ${url}: ${body}`);
    error("Confirm Attendee container secrets and external Postgres/Redis settings are configured.");
    throw new Error(`Attendee health check returned ${response.status} for ${url}`);
  }

  log(`Attendee health check succeeded for ${url}.`);
}

export function parseAttendeeDeployEnvironment(args: string[]): "production" | "staging" {
  const envFlagIndex = args.indexOf("--env");
  const value = envFlagIndex >= 0 ? args[envFlagIndex + 1] : "production";
  if (value === "production" || value === "staging") return value;
  throw new Error(`Unsupported attendee deploy environment "${value}". Use "production" or "staging".`);
}

function attendeeBaseUrl(environment: "production" | "staging"): string {
  return environment === "staging" ? "https://staging-attendee.wgsglobal.app" : "https://attendee.wgsglobal.app";
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);

if (isCli) {
  deployAttendee({ environment: parseAttendeeDeployEnvironment(process.argv) }).catch((error: unknown) => {
    console.error(deployErrorMessage(error));
    process.exitCode = 1;
  });
}

function deployErrorMessage(error: unknown): string {
  if (error instanceof Error && "output" in error && typeof error.output === "string" && error.output.length > 0) {
    return `${error.message}\n${error.output}`;
  }
  return error instanceof Error ? error.message : String(error);
}
