import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { env as workerEnv } from "cloudflare:workers";

type AttendeeContainerEnv = {
  ATTENDEE_WEB: DurableObjectNamespace<AttendeeWebContainer>;
  ATTENDEE_WORKER: DurableObjectNamespace<AttendeeWorkerContainer>;
  ATTENDEE_SCHEDULER: DurableObjectNamespace<AttendeeSchedulerContainer>;
  ATTENDEE_WEB_INSTANCES?: string;
  ATTENDEE_CONTAINER_SLEEP_AFTER?: string;
  DJANGO_SETTINGS_MODULE?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  SECRET_KEY?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_STORAGE_BUCKET_NAME?: string;
  AWS_S3_ENDPOINT_URL?: string;
  AWS_S3_REGION_NAME?: string;
  EMAIL_HOST_USER?: string;
  EMAIL_HOST_PASSWORD?: string;
  DEEPGRAM_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL_NAME?: string;
  ZOOM_CLIENT_ID?: string;
  ZOOM_CLIENT_SECRET?: string;
};

const requiredSettings = ["DATABASE_URL", "REDIS_URL", "SECRET_KEY"] as const;

export class AttendeeWebContainer extends Container {
  defaultPort = 8000;
  sleepAfter = getGlobal("ATTENDEE_CONTAINER_SLEEP_AFTER") || "24h";
  entrypoint = ["gunicorn", "attendee.wsgi", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"];
  envVars = buildContainerEnv(workerEnv as AttendeeContainerEnv);
}

export class AttendeeWorkerContainer extends Container {
  sleepAfter = getGlobal("ATTENDEE_CONTAINER_SLEEP_AFTER") || "24h";
  entrypoint = ["celery", "-A", "attendee", "worker", "-l", "INFO"];
  envVars = buildContainerEnv(workerEnv as AttendeeContainerEnv);
}

export class AttendeeSchedulerContainer extends Container {
  sleepAfter = getGlobal("ATTENDEE_CONTAINER_SLEEP_AFTER") || "24h";
  entrypoint = ["python", "manage.py", "run_scheduler"];
  envVars = buildContainerEnv(workerEnv as AttendeeContainerEnv);
}

export default {
  async fetch(request: Request, env: AttendeeContainerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_ops/health") {
      const missing = missingSettings(env);
      return Response.json(
        {
          ok: missing.length === 0,
          runtime: "cloudflare-containers",
          missing
        },
        { status: missing.length === 0 ? 200 : 503 }
      );
    }

    if (url.pathname === "/_ops/start-workers" && request.method === "POST") {
      await startBackgroundContainers(env);
      return Response.json({ ok: true });
    }

    const instances = Number.parseInt(env.ATTENDEE_WEB_INSTANCES || "1", 10);
    const web = await getRandom(env.ATTENDEE_WEB, Number.isFinite(instances) && instances > 0 ? instances : 1);
    return web.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, env: AttendeeContainerEnv): Promise<void> {
    await startBackgroundContainers(env);
  }
};

async function startBackgroundContainers(env: AttendeeContainerEnv): Promise<void> {
  const runtimeEnv = buildContainerEnv(env);
  await getContainer(env.ATTENDEE_WORKER, "primary").start({
    envVars: runtimeEnv,
    entrypoint: ["celery", "-A", "attendee", "worker", "-l", "INFO"]
  });
  await getContainer(env.ATTENDEE_SCHEDULER, "primary").start({
    envVars: runtimeEnv,
    entrypoint: ["python", "manage.py", "run_scheduler"]
  });
}

function buildContainerEnv(env: AttendeeContainerEnv): Record<string, string> {
  const result: Record<string, string> = {
    DJANGO_SETTINGS_MODULE: env.DJANGO_SETTINGS_MODULE || "attendee.settings.production"
  };

  for (const key of [
    "DATABASE_URL",
    "REDIS_URL",
    "SECRET_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_STORAGE_BUCKET_NAME",
    "AWS_S3_ENDPOINT_URL",
    "AWS_S3_REGION_NAME",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "DEEPGRAM_API_KEY",
    "OPENAI_API_KEY",
    "OPENAI_BASE_URL",
    "OPENAI_MODEL_NAME",
    "ZOOM_CLIENT_ID",
    "ZOOM_CLIENT_SECRET"
  ] as const) {
    const value = env[key];
    if (value) result[key] = value;
  }

  return result;
}

function missingSettings(env: AttendeeContainerEnv): string[] {
  return requiredSettings.filter((key) => !env[key]);
}

function getGlobal(key: "ATTENDEE_CONTAINER_SLEEP_AFTER"): string | undefined {
  return (workerEnv as AttendeeContainerEnv)[key];
}
