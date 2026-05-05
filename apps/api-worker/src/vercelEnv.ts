import type { Env, QueueBinding, WorkflowBinding } from "./env";

export type VercelProcessEnv = Record<string, string | undefined>;

export function createVercelEnv(source: VercelProcessEnv = process.env): Env {
  return {
    DB: createUnsupportedD1Database("DB"),
    ARTIFACTS: createUnsupportedR2Bucket("ARTIFACTS"),
    INVITE_QUEUE: createUnsupportedQueue("INVITE_QUEUE"),
    SUMMARY_QUEUE: createUnsupportedQueue("SUMMARY_QUEUE"),
    EMAIL_QUEUE: createUnsupportedQueue("EMAIL_QUEUE"),
    MEETING_WORKFLOW: createUnsupportedWorkflow("MEETING_WORKFLOW"),
    APP_BASE_URL: source.APP_BASE_URL ?? source.VERCEL_PROJECT_PRODUCTION_URL ?? "http://localhost:3000",
    API_BASE_URL: source.API_BASE_URL ?? source.APP_BASE_URL ?? source.VERCEL_PROJECT_PRODUCTION_URL ?? "http://localhost:3000",
    ATTENDEE_API_BASE_URL: source.ATTENDEE_API_BASE_URL ?? "http://localhost:8000",
    DEFAULT_RECORDER_EMAIL: source.DEFAULT_RECORDER_EMAIL ?? "notetaker@example.com",
    DEFAULT_SENDER_EMAIL: source.DEFAULT_SENDER_EMAIL ?? source.DEFAULT_RECORDER_EMAIL ?? "notetaker@example.com",
    ENVIRONMENT: source.ENVIRONMENT ?? source.VERCEL_ENV ?? "development",
    ATTENDEE_API_KEY: source.ATTENDEE_API_KEY,
    ATTENDEE_WEBHOOK_SECRET: source.ATTENDEE_WEBHOOK_SECRET,
    AI_API_KEY: source.AI_API_KEY,
    EMAIL_API_KEY: source.EMAIL_API_KEY,
    SMTP_PASSWORD: source.SMTP_PASSWORD,
    SESSION_SECRET: source.SESSION_SECRET,
    CLERK_SECRET_KEY: source.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: source.CLERK_PUBLISHABLE_KEY ?? source.VITE_CLERK_PUBLISHABLE_KEY,
    CLERK_AUTHORIZED_PARTIES: source.CLERK_AUTHORIZED_PARTIES,
    CLERK_ADMIN_USER_IDS: source.CLERK_ADMIN_USER_IDS,
    ADMIN_EMAILS: source.ADMIN_EMAILS
  };
}

export function unsupportedBindingMessage(binding: string): string {
  return `${binding} is a Cloudflare binding and is not configured for the Vercel runtime yet. Configure a Vercel-native adapter before using this route.`;
}

function unsupported(binding: string): Error {
  return new Error(unsupportedBindingMessage(binding));
}

function createUnsupportedD1Database(binding: string): D1Database {
  return {
    prepare() {
      return createUnsupportedPreparedStatement(binding);
    },
    batch() {
      return Promise.reject(unsupported(binding));
    },
    exec() {
      return Promise.reject(unsupported(binding));
    },
    dump() {
      return Promise.reject(unsupported(binding));
    }
  } as unknown as D1Database;
}

function createUnsupportedPreparedStatement(binding: string): D1PreparedStatement {
  return {
    bind() {
      return createUnsupportedPreparedStatement(binding);
    },
    first() {
      return Promise.reject(unsupported(binding));
    },
    run() {
      return Promise.reject(unsupported(binding));
    },
    all() {
      return Promise.reject(unsupported(binding));
    },
    raw() {
      return Promise.reject(unsupported(binding));
    }
  } as unknown as D1PreparedStatement;
}

function createUnsupportedR2Bucket(binding: string): R2Bucket {
  const reject = () => Promise.reject(unsupported(binding));
  return {
    get: reject,
    put: reject,
    delete: reject,
    list: reject,
    head: reject,
    createMultipartUpload: reject,
    resumeMultipartUpload() {
      throw unsupported(binding);
    }
  } as unknown as R2Bucket;
}

function createUnsupportedQueue(binding: string): QueueBinding {
  return {
    send() {
      return Promise.reject(unsupported(binding));
    }
  };
}

function createUnsupportedWorkflow(binding: string): WorkflowBinding {
  return {
    create() {
      return Promise.reject(unsupported(binding));
    }
  };
}
