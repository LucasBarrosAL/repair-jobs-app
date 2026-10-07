import { useQuery } from "@tanstack/react-query";
import { jobsForClient } from "@/domain/jobs";
import { getJobs, jobsQueryKey } from "@/features/jobs/getJobs";
import type { JobsQueryData } from "@/features/jobs/getJobs";
import { useAppStore } from "@/store/appStore";

const emptyCopy = {
  client: {
    heading: "No jobs yet",
    body: "Create a repair job to get started.",
  },
  pro: {
    heading: "No jobs to pick up",
    body: "New repair jobs will show up here.",
  },
} as const;

const loadErrorMessage = "Couldn't load available jobs.";

export function useJobsQuery() {
  const session = useAppStore((state) => state.session);
  const isClient = session?.role === "client";
  const username = isClient ? session.username : null;

  return useQuery({
    queryKey: jobsQueryKey(session),
    queryFn: () =>
      getJobs(useAppStore.getState().session, useAppStore.getState().jobs),
    initialData: username
      ? (): JobsQueryData => ({
          jobs: jobsForClient(useAppStore.getState().jobs, username),
          todos: [],
          loadFailed: false,
        })
      : undefined,
    staleTime: 0,
  });
}

export function useJobs() {
  const session = useAppStore((state) => state.session);
  const query = useJobsQuery();
  const isPro = session?.role === "pro";

  return {
    jobs: query.data?.jobs ?? [],
    isLoading: isPro && query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    canCreate: session?.role === "client",
    empty: isPro ? emptyCopy.pro : emptyCopy.client,
    loadError: query.data?.loadFailed ? loadErrorMessage : null,
  };
}
