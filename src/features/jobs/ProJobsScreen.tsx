import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useHasHydrated } from "@/store/useHasHydrated";
import { theme } from "@/theme/tokens";
import { EmptyJobs } from "@/features/jobs/components/EmptyJobs";
import { JobList } from "@/features/jobs/components/JobList";
import { JobListSkeleton } from "@/features/jobs/JobListSkeleton";
import { JobsFrame } from "@/features/jobs/components/JobsFrame";
import { useJobs } from "@/features/jobs/hooks/useJobs";

export function ProJobsScreen() {
  const hydrated = useHasHydrated();
  const { jobs, isLoading, isError, isRefetching, refetch } = useJobs();
  const showSkeleton = !hydrated || isLoading;

  return (
    <JobsFrame
      banner={
        isError ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {"Couldn't load available jobs."}
            </Text>
            <Button label="Retry" onPress={() => void refetch()} />
          </View>
        ) : null
      }
    >
      {showSkeleton ? (
        <JobListSkeleton />
      ) : (
        <JobList
          jobs={jobs}
          empty={<EmptyJobs role="pro" />}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      )}
    </JobsFrame>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: theme.space.sm,
  },
  bannerText: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
});
