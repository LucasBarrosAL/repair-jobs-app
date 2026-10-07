import type { DummyTodo, Job } from "@/domain/types";

export const titleRequiredMessage = "Enter a title to create this job.";
export const deleteClaimedMessage =
  "This job has been claimed and can't be deleted.";

export type CreateJobInput = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

export type CreateJobResult =
  | { ok: true; job: Job }
  | { ok: false; message: string };

export type DeleteJobResult =
  | { ok: true; jobs: Job[] }
  | { ok: false; jobs: Job[]; message: string };

export function createJob(input: CreateJobInput): CreateJobResult {
  const title = input.title.trim();
  if (title.length < 1) {
    return { ok: false, message: titleRequiredMessage };
  }

  return {
    ok: true,
    job: {
      id: input.id,
      title,
      description: input.description.trim(),
      status: "open",
      createdBy: input.createdBy,
      claimedBy: null,
      createdAt: input.createdAt,
    },
  };
}

export function deleteJob(jobs: Job[], id: string): DeleteJobResult {
  const job = jobs.find((item) => item.id === id);
  if (!job) {
    return { ok: false, jobs, message: "This job is no longer available." };
  }
  if (job.claimedBy !== null) {
    return { ok: false, jobs, message: deleteClaimedMessage };
  }

  return { ok: true, jobs: jobs.filter((item) => item.id !== id) };
}

export function jobsForClient(jobs: Job[], username: string): Job[] {
  return jobs.filter((job) => job.createdBy === username).sort(compareJobs);
}

const dayMs = 24 * 60 * 60 * 1000;

export function materializeRemoteJob(todo: DummyTodo): Job {
  return {
    id: `remote_${todo.id}`,
    title: todo.todo,
    description: `Repair job ${todo.id}`,
    status: "open",
    createdBy: `client-${todo.id}`,
    claimedBy: null,
    createdAt: new Date(Date.UTC(2024, 0, 1) + todo.id * dayMs).toISOString(),
  };
}

export function claimJob(
  jobs: Job[],
  id: string,
  username: string,
  todo: DummyTodo | null,
): Job[] {
  const index = jobs.findIndex((job) => job.id === id);
  if (index >= 0) {
    const job = jobs[index];
    if (!job || job.status !== "open" || job.claimedBy !== null) {
      return jobs;
    }
    const next = jobs.slice();
    next[index] = { ...job, status: "claimed", claimedBy: username };
    return next;
  }

  if (!todo || todo.completed || `remote_${todo.id}` !== id) {
    return jobs;
  }

  return [
    ...jobs,
    { ...materializeRemoteJob(todo), status: "claimed", claimedBy: username },
  ];
}

export function completeJob(jobs: Job[], id: string, username: string): Job[] {
  const index = jobs.findIndex((job) => job.id === id);
  if (index < 0) {
    return jobs;
  }
  const job = jobs[index];
  if (!job || job.status !== "claimed" || job.claimedBy !== username) {
    return jobs;
  }
  const next = jobs.slice();
  next[index] = { ...job, status: "completed" };
  return next;
}

export function jobsForPro(
  jobs: Job[],
  todos: DummyTodo[],
  username: string,
): Job[] {
  const localIds = new Set(jobs.map((job) => job.id));
  const visible = jobs.filter((job) => isVisibleToPro(job, username));
  const localMatches = visible.filter(isLocalJob).sort(compareJobs);
  const remoteMatches = [
    ...visible.filter((job) => !isLocalJob(job)),
    ...todos
      .filter((todo) => !todo.completed && !localIds.has(`remote_${todo.id}`))
      .map(materializeRemoteJob),
  ].sort(compareJobs);

  return [...localMatches, ...remoteMatches];
}

function isLocalJob(job: Job): boolean {
  return job.id.startsWith("local_");
}

function isVisibleToPro(job: Job, username: string): boolean {
  if (job.status === "open") {
    return true;
  }
  return job.status === "claimed" && job.claimedBy === username;
}

function compareJobs(left: Job, right: Job): number {
  if (left.createdAt !== right.createdAt) {
    return left.createdAt < right.createdAt ? -1 : 1;
  }
  if (left.id !== right.id) {
    return left.id < right.id ? -1 : 1;
  }
  return 0;
}
