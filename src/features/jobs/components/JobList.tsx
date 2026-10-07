import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import type { Job } from "@/domain/types";
import { theme } from "@/theme/tokens";
import { JobRow } from "@/features/jobs/components/JobRow";

type JobListProps = {
  jobs: Job[];
  empty: ReactElement;
  refreshing: boolean;
  onRefresh: () => void;
};

export function JobList({ jobs, empty, refreshing, onRefresh }: JobListProps) {
  const router = useRouter();

  return (
    <FlatList
      testID="job-list"
      data={jobs}
      keyExtractor={(job) => job.id}
      renderItem={({ item }) => (
        <JobRow job={item} onPress={() => router.push(`/jobs/${item.id}`)} />
      )}
      ListEmptyComponent={empty}
      style={styles.fill}
      contentContainerStyle={jobs.length === 0 ? styles.emptyList : styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.color.primary}
          colors={[theme.color.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  list: {
    paddingBottom: theme.space.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
});
