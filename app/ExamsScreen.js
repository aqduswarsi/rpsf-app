import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, FileText, Target, ChevronRight } from "lucide-react-native";
import { getUserExams } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ExamsScreen() {
  const insets = useSafeAreaInsets();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await getUserExams();
        setExams(data);
      } catch (err) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SPACING.xl },
      ]}
      data={exams}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Exams</Text>
          <Text style={styles.headerSub}>
            Select an exam to start your assessment.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <FileText color={COLORS.line} size={48} strokeWidth={1.5} />
          <Text style={styles.emptyText}>
            No exams available at the moment.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>{item.step}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock color={COLORS.muted} size={16} strokeWidth={1.5} />
              <Text style={styles.metaText}>{item.duration} mins</Text>
            </View>
            <View style={styles.metaItem}>
              <FileText color={COLORS.muted} size={16} strokeWidth={1.5} />
              <Text style={styles.metaText}>{item.questionCount} Qs</Text>
            </View>
            <View style={styles.metaItem}>
              <Target color={COLORS.muted} size={16} strokeWidth={1.5} />
              <Text style={styles.metaText}>{item.passPercentage}% Pass</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionText}>Start Exam</Text>
            <ChevronRight color={COLORS.surface} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
  content: { padding: SPACING.md },

  header: { marginVertical: SPACING.md },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    color: COLORS.navy,
    marginBottom: 4,
  },
  headerSub: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted },

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  stepBadge: {
    backgroundColor: COLORS.mist,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  stepText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.blue,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    flex: 1,
  },

  description: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: SPACING.md,
  },

  metaRow: { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.lg },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.ink },

  actionButton: {
    backgroundColor: COLORS.navy,
    height: 44,
    borderRadius: RADIUS.button,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },
  actionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.surface,
  },

  emptyContainer: { alignItems: "center", marginTop: SPACING.xl },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.md,
  },
});
