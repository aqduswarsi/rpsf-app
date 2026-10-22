import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { getMyResultById } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ResultDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { resultId } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const data = await getMyResultById(resultId);
        setResult(data);
      } catch (err) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Result not found.</Text>
      </View>
    );
  }

  const isPassed = result.status === "Pass";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.ink} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Result Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.examTitle}>{result.examId?.title || "Exam"}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>
              {result.totalScore}/{result.maxScore}
            </Text>
            <Text
              style={[
                styles.status,
                { color: isPassed ? "#15803D" : COLORS.error },
              ]}
            >
              {result.status}
            </Text>
          </View>
          <Text style={styles.percentage}>{result.percentage}%</Text>
        </View>

        <Text style={styles.sectionTitle}>Answers Breakdown</Text>

        {result.answers.map((ans, index) => (
          <View key={ans.questionId} style={styles.answerCard}>
            <Text style={styles.qText}>
              Q{index + 1}. {ans.questionText}
            </Text>
            <Text style={styles.ansText}>
              Your Answer:{" "}
              <Text style={{ fontFamily: FONTS.medium }}>
                {ans.userAnswer || "(Not answered)"}
              </Text>
            </Text>
            {!ans.isCorrect && ans.type !== "Written" && (
              <Text style={styles.correctText}>
                Correct Answer: {ans.correctAnswer}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
  errorText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.error },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.navy },
  content: { padding: SPACING.md },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  examTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.navy,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  score: { fontFamily: FONTS.semiBold, fontSize: 32, color: COLORS.blue },
  status: { fontFamily: FONTS.semiBold, fontSize: 16 },
  percentage: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.muted },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  answerCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  ansText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
  },
  correctText: { fontFamily: FONTS.medium, fontSize: 13, color: "#15803D" },
});
