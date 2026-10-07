import { Image, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/tokens";

type EmptyJobsProps = {
  heading: string;
  body: string;
};

export function EmptyJobs({ heading, body }: EmptyJobsProps) {
  return (
    <View style={styles.empty}>
      <Image
        source={require("../../../../assets/images/empty-jobs.png")}
        style={styles.image}
        accessible={false}
      />
      <Text accessibilityRole="header" style={styles.heading}>
        {heading}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: theme.space.sm,
    paddingVertical: theme.space.xl,
  },
  image: {
    width: 160,
    height: 160,
  },
  heading: {
    color: theme.color.text,
    fontSize: theme.font.title.fontSize,
    lineHeight: theme.font.title.lineHeight,
    textAlign: "center",
  },
  body: {
    color: theme.color.textBody,
    fontSize: theme.font.body.fontSize,
    lineHeight: theme.font.body.lineHeight,
    textAlign: "center",
  },
});
