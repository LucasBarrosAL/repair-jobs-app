import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useAppStore } from "@/store/appStore";
import { JobUnavailable } from "@/features/jobs/components/JobUnavailable";
import { useJobDetails } from "@/features/jobs/hooks/useJobDetails";
import { useJobId } from "@/features/jobs/hooks/useJobId";
import { JobDetailsBody } from "./JobDetailsBody";

export function JobDetailsScreen() {
  const jobId = useJobId();
  const { job, todo, actions } = useJobDetails(jobId);
  const deleteJob = useAppStore((state) => state.deleteJob);
  const claimJob = useAppStore((state) => state.claimJob);
  const completeJob = useAppStore((state) => state.completeJob);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!job) {
      return;
    }
    const result = deleteJob(job.id);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/jobs");
  }

  function onClaim() {
    if (!job) {
      return;
    }
    claimJob(job.id, todo);
  }

  function onComplete() {
    if (!job) {
      return;
    }
    completeJob(job.id);
  }

  if (!job) {
    return <JobUnavailable />;
  }

  return (
    <JobDetailsBody
      job={job}
      error={error}
      actions={
        <>
          {actions.delete !== "hidden" ? (
            <Button label="Delete" variant="destructive" onPress={onDelete} disabled={actions.delete === "disabled"} />
          ) : null}
          {actions.claim !== "hidden" ? (
            <Button label="Claim" onPress={onClaim} disabled={actions.claim === "disabled"} />
          ) : null}
          {actions.complete !== "hidden" ? (
            <Button
              label="Mark as completed"
              onPress={onComplete}
              disabled={actions.complete === "disabled"}
            />
          ) : null}
        </>
      }
    />
  );
}
