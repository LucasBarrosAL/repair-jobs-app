import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "@/components/Button";
import { jobsForClient } from "@/domain/jobs";
import { useAppStore } from "@/store/appStore";
import { JobUnavailable } from "@/features/jobs/JobUnavailable";
import { useJobId } from "@/features/jobs/useJobId";
import { JobDetailsBody } from "./JobDetailsBody";

export function ClientJobDetailsScreen() {
  const jobId = useJobId();
  const session = useAppStore((state) => state.session);
  const jobs = useAppStore((state) => state.jobs);
  const deleteJob = useAppStore((state) => state.deleteJob);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const job = session
    ? jobsForClient(jobs, session.username).find((item) => item.id === jobId)
    : undefined;

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
