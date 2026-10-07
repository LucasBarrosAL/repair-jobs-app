import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "@/components/Button";
import { JobUnavailable } from "@/features/jobs/components/JobUnavailable";
import { useClaimJob, useCompleteJob, useDeleteJob } from "@/features/jobs/hooks/useJobMutations";
import { useJobDetails } from "@/features/jobs/hooks/useJobDetails";
import { useJobId } from "@/features/jobs/hooks/useJobId";
import { JobDetailsBody } from "./JobDetailsBody";

export function JobDetailsScreen() {
  const jobId = useJobId();
  const { job, todo, actions } = useJobDetails(jobId);
  const deleteJob = useDeleteJob();
  const claimJob = useClaimJob();
  const completeJob = useCompleteJob();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!job) {
      return;
    }
    const result = await deleteJob.mutateAsync(job);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/jobs");
  }

  async function onClaim() {
    if (!job) {
      return;
    }
    const result = await claimJob.mutateAsync({ job, todo });
    if (!result.ok) {
      setError(result.message);
    }
  }

  async function onComplete() {
    if (!job) {
      return;
    }
    const result = await completeJob.mutateAsync(job);
    if (!result.ok) {
      setError(result.message);
    }
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
            <Button
              label="Delete"
              variant="destructive"
              onPress={() => void onDelete()}
              disabled={actions.delete === "disabled"}
            />
          ) : null}
          {actions.claim !== "hidden" ? (
            <Button label="Claim" onPress={() => void onClaim()} disabled={actions.claim === "disabled"} />
          ) : null}
          {actions.complete !== "hidden" ? (
            <Button
              label="Mark as completed"
              onPress={() => void onComplete()}
              disabled={actions.complete === "disabled"}
            />
          ) : null}
        </>
      }
    />
  );
}
