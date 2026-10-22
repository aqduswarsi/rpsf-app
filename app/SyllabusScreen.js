import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen } from "lucide-react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function SyllabusScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Syllabus</Text>

        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <BookOpen color={COLORS.navy} size={32} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Course Syllabus</Text>
          <Text style={styles.description}>
            The detailed syllabus and study materials will be updated here soon.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  content: {
    padding: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.navy,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    alignItems: "center",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.paper,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
