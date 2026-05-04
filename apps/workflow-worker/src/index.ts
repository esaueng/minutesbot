import { cleanupOldArtifacts, handleQueueBatch } from "./queueConsumers";
import { MeetingWorkflow } from "./meetingWorkflow";

export { CleanupWorkflow } from "./cleanupWorkflow";
export { MeetingWorkflow } from "./meetingWorkflow";
export { SummaryWorkflow } from "./summaryWorkflow";
export { TranscriptWorkflow } from "./transcriptWorkflow";

export default {
  async queue(batch: MessageBatch<unknown>, env: WorkflowEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleQueueBatch(batch, env));
  },
  async scheduled(_event: ScheduledEvent, env: WorkflowEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(cleanupOldArtifacts(env));
  }
};

export type WorkflowEnv = {
  DB: D1Database;
  ARTIFACTS: R2Bucket;
  SUMMARY_QUEUE: { send(message: unknown): Promise<void> };
  EMAIL_QUEUE: { send(message: unknown): Promise<void> };
  ATTENDEE_API_KEY?: string;
  ATTENDEE_API_BASE_URL: string;
  ATTENDEE_WEBHOOK_SECRET?: string;
  API_BASE_URL: string;
  AI_API_KEY?: string;
  SEND_EMAIL?: { send: (message: unknown) => Promise<unknown> };
};
