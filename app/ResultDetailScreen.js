import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ChevronLeft, CheckCircle, XCircle, Clock } from "lucide-react-native";
import { getMyResultById } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ResultDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();

  // Route se resultId nikalo
  const { resultId } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const data = await getMyResultById(resultId);
        setResult(data);
      } catch (err) {
        console.log("Error loading detail:", err);
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
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading details...
        </Text>
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
  let StatusIcon = Clock;
  let statusColor = "#D97706";
  if (result.status === "Pass") {
    StatusIcon = CheckCircle;
    statusColor = "#16A34A";
  } else if (result.status === "Fail") {
    StatusIcon = XCircle;
    statusColor = COLORS.error;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
            <View style={styles.statusWrap}>
              <StatusIcon color={statusColor} size={18} />
              <Text style={[styles.status, { color: statusColor }]}>
                {result.status}
              </Text>
            </View>
          </View>
          <Text style={styles.percentage}>{result.percentage}% Score</Text>
        </View>

        <Text style={styles.sectionTitle}>Question Breakdown</Text>

        {result.answers &&
          result.answers.map((ans, index) => (
            <View key={ans.questionId || index} style={styles.answerCard}>
              <View style={styles.qHeader}>
                <Text style={styles.qNumber}>Q{index + 1}.</Text>
                <Text style={styles.qType}>{ans.type}</Text>
                <Text
                  style={[
                    styles.qMarks,
                    { color: ans.isCorrect ? "#16A34A" : COLORS.error },
                  ]}
                >
                  {ans.marks}/{ans.maxMarks} Marks
                </Text>
              </View>

              <Text style={styles.qText}>{ans.questionText}</Text>

              <View style={styles.ansRow}>
                <Text style={styles.ansLabel}>Your Answer:</Text>
                <Text
                  style={[
                    styles.ansText,
                    !ans.isCorrect &&
                      ans.type !== "Written" && { color: COLORS.error },
                  ]}
                >
                  {ans.userAnswer || "(Not answered)"}
                </Text>
              </View>

              {!ans.isCorrect && ans.type !== "Written" && (
                <View style={styles.ansRow}>
                  <Text style={styles.ansLabel}>Correct Answer:</Text>
                  <Text style={[styles.ansText, { color: "#16A34A" }]}>
                    {ans.correctAnswer}
                  </Text>
                </View>
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
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },
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
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: 8,
  },
  score: { fontFamily: FONTS.semiBold, fontSize: 32, color: COLORS.blue },
  statusWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  qHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  qNumber: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.navy,
    marginRight: 8,
  },
  qType: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.blue,
    backgroundColor: COLORS.mist,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flex: 1,
    maxWidth: 100,
    textAlign: "center",
  },
  qMarks: { fontFamily: FONTS.semiBold, fontSize: 12, marginLeft: "auto" },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  ansRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  ansLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.muted,
    width: 110,
  },
  ansText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.ink,
    flex: 1,
  },
});
