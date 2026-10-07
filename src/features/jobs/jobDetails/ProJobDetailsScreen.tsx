import { Button } from "@/components/Button";
import { useAppStore } from "@/store/appStore";
import { JobUnavailable } from "@/features/jobs/components/JobUnavailable";
import { useJobId } from "@/features/jobs/hooks/useJobId";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { JobDetailsBody } from "./JobDetailsBody";

export function ProJobDetailsScreen() {
  const jobId = useJobId();
  const session = useAppStore((state) => state.session);
  const claimJob = useAppStore((state) => state.claimJob);
  const completeJob = useAppStore((state) => state.completeJob);
  const { findJob, todoFor } = useJobs();
  const job = findJob(jobId);

  function onClaim() {
    if (!job) {
      return;
    }
    claimJob(job.id, todoFor(job.id));
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
