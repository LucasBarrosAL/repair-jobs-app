import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useAppStore } from "@/store/appStore";
import { JobUnavailable } from "@/features/jobs/components/JobUnavailable";
import { useJobId } from "@/features/jobs/hooks/useJobId";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { JobDetailsBody } from "./JobDetailsBody";

export function ClientJobDetailsScreen() {
  const jobId = useJobId();
  const deleteJob = useAppStore((state) => state.deleteJob);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { findJob } = useJobs();
  const job = findJob(jobId);

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

  if (!job) {
    return <JobUnavailable />;
  }

  return (
    <JobDetailsBody
      job={job}
      error={error}
      actions={
        <Button label="Delete" variant="destructive" onPress={onDelete} />
      }
    />
  );
}
