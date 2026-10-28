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
  const statusColor = isPassed
    ? "#16A34A"
    : result.status === "Fail"
      ? COLORS.error
      : "#D97706";
  const StatusIcon = isPassed
    ? CheckCircle
    : result.status === "Fail"
      ? XCircle
      : Clock;

  const examTitle = result.examId?.title || "Exam";
  const courseName = result.courseId?.name || "Course";
  const subjectName = result.subjectId?.name || "Subject";

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.navy} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Result — {examTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>COURSE</Text>
              <Text style={styles.summaryValue}>{courseName}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>SUBJECT</Text>
              <Text style={styles.summaryValue}>{subjectName}</Text>
            </View>
          </View>

          <View style={[styles.summaryRow, { marginTop: 16 }]}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>SCORE</Text>
              <Text style={styles.summaryValueBold}>
                {result.totalScore}/{result.maxScore} ({result.percentage}%)
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>STATUS</Text>
              <View style={styles.statusWrap}>
                <StatusIcon color={statusColor} size={14} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {result.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Answers Breakdown */}
        <Text style={styles.sectionTitle}>Answers Breakdown</Text>

        {result.answers.map((ans, index) => {
          const isWritten = ans.type === "Written";
          const isCorrect = ans.isCorrect;

          return (
            <View
              key={index}
              style={[
                styles.answerCard,
                {
                  borderLeftColor: isWritten
                    ? "#D97706"
                    : isCorrect
                      ? "#16A34A"
                      : COLORS.error,
                },
              ]}
            >
              {/* Question Header */}
              <View style={styles.qHeader}>
                <Text style={styles.qNumber}>
                  Q{index + 1} — {ans.type}
                </Text>
                <View style={styles.marksWrap}>
                  {isWritten ? (
                    <Text style={styles.pendingText}>Pending Review</Text>
                  ) : isCorrect ? (
                    <Text style={styles.correctText}>
                      Correct ({ans.marks}/{ans.maxMarks})
                    </Text>
                  ) : (
                    <Text style={styles.wrongText}>
                      Wrong ({ans.marks}/{ans.maxMarks})
                    </Text>
                  )}
                </View>
              </View>

              {/* Question Text */}
              <Text style={styles.questionText}>{ans.questionText}</Text>

              {/* User Answer */}
              <View style={styles.ansRow}>
                <Text style={styles.ansLabel}>Your Answer:</Text>
                <Text
                  style={[
                    styles.ansText,
                    !isCorrect && !isWritten && { color: COLORS.error },
                  ]}
                >
                  {ans.userAnswer || "(Not Answered)"}
                </Text>
              </View>

              {/* Correct Answer */}
              {!isWritten && (
                <View style={styles.ansRow}>
                  <Text style={styles.ansLabel}>Correct Answer:</Text>
                  <Text style={[styles.ansText, { color: "#16A34A" }]}>
                    {ans.correctAnswer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    flex: 1,
    textAlign: "center",
  },

  content: { padding: SPACING.md, paddingBottom: 40 },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: "#FFF5F5", // Light red background
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: SPACING.lg,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryCol: { flex: 1 },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.ink },
  summaryValueBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    textTransform: "capitalize",
  },

  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.sm,
  },

  // Answer Card Styles
  answerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderLeftWidth: 4, // Yeh border color dynamic hai
  },
  qHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  qNumber: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.navy },
  marksWrap: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  correctText: { fontFamily: FONTS.semiBold, fontSize: 11, color: "#16A34A" },
  wrongText: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.error },
  pendingText: { fontFamily: FONTS.semiBold, fontSize: 11, color: "#D97706" },

  questionText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 16,
    lineHeight: 22,
  },

  ansRow: { flexDirection: "row", marginBottom: 8 },
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
