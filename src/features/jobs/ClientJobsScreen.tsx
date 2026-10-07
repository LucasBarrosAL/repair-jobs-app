import { useRouter } from "expo-router";
import { useHasHydrated } from "@/store/useHasHydrated";
import { EmptyJobs } from "@/features/jobs/components/EmptyJobs";
import { JobList } from "@/features/jobs/components/JobList";
import { JobListSkeleton } from "@/features/jobs/JobListSkeleton";
import { JobsFrame } from "@/features/jobs/components/JobsFrame";
import { useJobs } from "@/features/jobs/hooks/useJobs";

export function ClientJobsScreen() {
  const hydrated = useHasHydrated();
  const router = useRouter();
  const { jobs, isRefetching, refetch } = useJobs();

  return (
    <JobsFrame onCreate={() => router.push("/jobs/create")}>
      {hydrated ? (
        <JobList
          jobs={jobs}
          empty={<EmptyJobs role="client" />}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      ) : (
        <JobListSkeleton />
      )}
    </JobsFrame>
  );
}
