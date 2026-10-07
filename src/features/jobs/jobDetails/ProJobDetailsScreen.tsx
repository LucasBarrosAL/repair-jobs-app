import { Button } from "@/components/Button";
import { jobsForPro } from "@/domain/jobs";
import type { DummyTodo, Job } from "@/domain/types";
import { useAppStore } from "@/store/appStore";
import { JobUnavailable } from "@/features/jobs/JobUnavailable";
import { useJobId } from "@/features/jobs/useJobId";
import { useRemoteTodos } from "@/features/jobs/useRemoteTodos";
import { JobDetailsBody } from "./JobDetailsBody";

export function ProJobDetailsScreen() {
  const jobId = useJobId();
  const session = useAppStore((state) => state.session);
  const jobs = useAppStore((state) => state.jobs);
  const claimJob = useAppStore((state) => state.claimJob);
  const completeJob = useAppStore((state) => state.completeJob);
  const todosQuery = useRemoteTodos(true);
  const job = session
    ? jobForPro(jobs, todosQuery.data ?? [], session.username, jobId)
    : undefined;

  function onClaim() {
    if (!job) {
      return;
    }
    const todo =
      todosQuery.data?.find((item) => `remote_${item.id}` === job.id) ?? null;
    claimJob(job.id, todo);
  }

  function onComplete() {
    if (!job) {
      return;
    }
    completeJob(job.id);
  }

  if (!job || !session) {
    return <JobUnavailable />;
  }

  return (
    <JobDetailsBody
      job={job}
      actions={
        <>
          <Button
            label="Claim"
            onPress={onClaim}
            disabled={job.status !== "open"}
          />
          <Button
            label="Mark as completed"
            onPress={onComplete}
            disabled={
              job.status !== "claimed" || job.claimedBy !== session.username
            }
          />
        </>
      }
    />
  );
}

function jobForPro(
  jobs: Job[],
  todos: DummyTodo[],
  username: string,
  jobId: string | undefined,
): Job | undefined {
  if (!jobId) {
    return undefined;
  }

  const listed = jobsForPro(jobs, todos, username).find(
    (item) => item.id === jobId,
  );
  if (listed) {
    return listed;
  }

  return jobs.find(
    (item) =>
      item.id === jobId &&
      item.claimedBy === username &&
      item.status === "completed",
  );
}
