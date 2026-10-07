import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { RoleSelector } from "@/components/RoleSelector";
import { TextField } from "@/components/TextField";
import { isUsernameValid, nextDraftRole, resolveRole } from "@/domain/auth";
import type { Role } from "@/domain/types";
import { useAppStore } from "@/store/appStore";
import { theme } from "@/theme/tokens";

export function LoginScreen() {
  const accounts = useAppStore((state) => state.accounts);
  const login = useAppStore((state) => state.login);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [draftRole, setDraftRole] = useState<Role>("client");
  const resolution = resolveRole(accounts, username, draftRole);
  const canContinue = isUsernameValid(username);

  useFocusEffect(
    useCallback(() => {
      setUsername("");
      setDraftRole("client");
    }, []),
  );

  function onUsernameChange(next: string) {
    setDraftRole((current) => nextDraftRole(username, next, accounts, current));
    setUsername(next);
  }

  function onContinue() {
    login(username, draftRole);
    router.replace("/jobs");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.keyboard}>
        <Text accessibilityRole="header" style={styles.title}>
          Repair jobs
        </Text>
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Username"
            value={username}
            onChangeText={onUsernameChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <RoleSelector
            value={resolution.role}
            locked={resolution.locked}
            onChange={setDraftRole}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Continue"
            onPress={onContinue}
            disabled={!canContinue}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  keyboard: {
    flex: 1,
    paddingHorizontal: theme.screenPadding,
    paddingTop: theme.screenPadding,
  },
  title: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
  },
  formScroll: {
    flex: 1,
  },
  form: {
    flexGrow: 1,
    justifyContent: "center",
    gap: theme.space.lg,
  },
  footer: {
    paddingTop: theme.space.lg,
    paddingBottom: theme.screenPadding,
  },
});
