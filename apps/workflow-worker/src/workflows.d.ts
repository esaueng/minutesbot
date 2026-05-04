declare class WorkflowEntrypoint<Env = unknown, Params = unknown> {
  env: Env;
}

type WorkflowEvent<Params = unknown> = {
  payload: Params;
};

type WorkflowStep = {
  do<T>(name: string, callback: () => Promise<T>): Promise<T>;
  sleep(name: string, until: string | Date | number): Promise<void>;
};
