import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { JobsMenu } from "@/features/jobs/components/JobsMenu";
import { JobRow } from "@/features/jobs/components/JobRow";
import { EmptyJobs } from "@/features/jobs/components/EmptyJobs";
import { JobListSkeleton } from "@/features/jobs/JobListSkeleton";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useAppStore } from "@/store/appStore";
import { useHasHydrated } from "@/store/useHasHydrated";
import { theme } from "@/theme/tokens";

export function JobsScreen() {
  const hydrated = useHasHydrated();
  const logout = useAppStore((state) => state.logout);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { jobs, isLoading, isRefetching, refetch, canCreate, empty, loadError } = useJobs();
  const showSkeleton = !hydrated || isLoading;

  function onLogout() {
    logout();
    router.replace("/");
  }

  function onRefresh() {
    void refetch();
  }

  return (
    <SafeAreaView style={styles.screen}>
      {menuOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}
          style={styles.backdrop}
        />
      ) : null}
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Jobs
        </Text>
        <View style={styles.actions}>
          {canCreate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create job"
              onPress={() => router.push("/jobs/create")}
              style={styles.iconButton}
            >
              <Ionicons name="add" size={28} color={theme.color.primary} />
            </Pressable>
          ) : null}
          <JobsMenu open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onLogout={onLogout} />
        </View>
      </View>
      {loadError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{loadError}</Text>
          <Button label="Retry" onPress={onRefresh} />
        </View>
      ) : null}
      {showSkeleton ? (
        <JobListSkeleton />
      ) : (
        <FlatList
          testID="job-list"
          data={jobs}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobRow job={item} onPress={() => router.push(`/jobs/${item.id}`)} />}
          ListEmptyComponent={<EmptyJobs heading={empty.heading} body={empty.body} />}
          style={styles.fill}
          contentContainerStyle={jobs.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.color.primary}
              colors={[theme.color.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
    gap: theme.space.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  header: {
    zIndex: 2,
    minHeight: theme.controlHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  iconButton: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    gap: theme.space.sm,
  },
  bannerText: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
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
