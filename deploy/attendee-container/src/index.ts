import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { env as workerEnv } from "cloudflare:workers";
import { buildContainerEnv, missingSettings, type AttendeeContainerSettings } from "./env";

type AttendeeContainerEnv = AttendeeContainerSettings & {
  ATTENDEE_WEB: DurableObjectNamespace<AttendeeWebContainer>;
  ATTENDEE_WORKER: DurableObjectNamespace<AttendeeWorkerContainer>;
  ATTENDEE_SCHEDULER: DurableObjectNamespace<AttendeeSchedulerContainer>;
};

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

function getGlobal(key: "ATTENDEE_CONTAINER_SLEEP_AFTER"): string | undefined {
  return (workerEnv as AttendeeContainerEnv)[key];
}
