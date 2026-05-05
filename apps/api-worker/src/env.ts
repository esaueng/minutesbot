export type QueueBinding<T = unknown> = {
  send(message: T): Promise<void>;
};

export type WorkflowBinding<T = unknown> = {
  create(options: { id?: string; params?: T }): Promise<unknown>;
};

export type Env = {
  DB: D1Database;
  ARTIFACTS: R2Bucket;
  INVITE_QUEUE: QueueBinding;
  SUMMARY_QUEUE: QueueBinding;
  EMAIL_QUEUE: QueueBinding;
  MEETING_WORKFLOW: WorkflowBinding;
  SEND_EMAIL?: { send: (message: unknown) => Promise<unknown> };
  APP_BASE_URL: string;
  API_BASE_URL: string;
  ATTENDEE_API_BASE_URL: string;
  DEFAULT_RECORDER_EMAIL: string;
  DEFAULT_SENDER_EMAIL: string;
  ENVIRONMENT: string;
  ATTENDEE_API_KEY?: string;
  ATTENDEE_WEBHOOK_SECRET?: string;
  AI_API_KEY?: string;
  EMAIL_API_KEY?: string;
  SMTP_PASSWORD?: string;
  SESSION_SECRET?: string;
};
