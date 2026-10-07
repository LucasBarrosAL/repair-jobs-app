import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { StatusTag } from "@/components/StatusTag";
import { formatCreatedAt } from "@/domain/createdAt";
import { JobUnavailable } from "@/features/jobs/components/JobUnavailable";
import { useClaimJob, useCompleteJob, useDeleteJob } from "@/features/jobs/hooks/useJobMutations";
import { useJobDetails } from "@/features/jobs/hooks/useJobDetails";
import { useJobId } from "@/features/jobs/hooks/useJobId";
import { theme } from "@/theme/tokens";

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

  const assignee = job.claimedBy === null ? "Pro: Unassigned" : `Pro: ${job.claimedBy}`;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={theme.color.primary} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          {job.title}
        </Text>
        {job.description ? <Text style={styles.body}>{job.description}</Text> : null}
        <StatusTag status={job.status} />
        <Text style={styles.body}>{assignee}</Text>
        <Text style={styles.caption}>Posted</Text>
        <Text style={styles.body}>{formatCreatedAt(job.createdAt)}</Text>
      </View>
      <View style={styles.actions}>
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
    padding: theme.screenPadding,
    justifyContent: "space-between",
  },
  content: {
    gap: theme.space.md,
  },
  back: {
    width: theme.controlHeight,
    minHeight: theme.controlHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  body: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  caption: {
    color: theme.color.text,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
  actions: {
    gap: theme.space.sm,
  },
  error: {
    color: theme.color.errorText,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
  },
});
