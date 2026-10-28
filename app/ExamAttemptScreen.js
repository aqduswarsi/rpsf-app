import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react-native";
import { getExamById, submitUserExam } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ExamAttemptScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { examId } = route.params;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Answers state: { questionId: "user's answer" }
  const [answers, setAnswers] = useState({});

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  // Result data for the success screen
  const [resultData, setResultData] = useState(null);

  // 1. Fetch Exam Data
  useEffect(() => {
    async function loadExam() {
      try {
        const data = await getExamById(examId);
        setExam(data);
        setTimeLeft((data.duration || 30) * 60); // duration in minutes
      } catch (err) {
        Alert.alert("Error", err.message || "Could not load exam");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId]);

  // 2. Timer Logic (Auto Submit)
  useEffect(() => {
    if (timeLeft <= 0 || loading || submitting || resultData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(true); // true denotes auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting, resultData]);

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleTextChange = (qId, text) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    Alert.alert("Submit Exam", "Are you sure you want to submit your exam?", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: () => submitExam(false) },
    ]);
  };

  const submitExam = async (isAuto = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const formattedAnswers = exam.questions.map((q) => ({
        questionId: q._id,
        userAnswer: answers[q._id] || "",
      }));

      const response = await submitUserExam(exam._id, formattedAnswers);

      // Store the result in state to display the scorecard
      setResultData(response.data || response);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit exam.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading Exam...
        </Text>
      </View>
    );
  }

  if (!exam) return null;

  // ==================== SUCCESS SCREEN ====================
  if (resultData) {
    const isPass = resultData.status === "Pass";
    const statusColor = isPass
      ? "#16A34A"
      : resultData.status === "Fail"
        ? COLORS.error
        : "#D97706";
    const StatusIcon = isPass
      ? CheckCircle
      : resultData.status === "Fail"
        ? XCircle
        : Clock;

    return (
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + 20, padding: SPACING.lg },
        ]}
      >
        <View style={styles.successCard}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isPass ? "#DCFCE7" : "#FEE2E2" },
            ]}
          >
            <StatusIcon color={statusColor} size={60} />
          </View>

          <Text style={styles.successTitle}>Exam Submitted!</Text>
          <Text style={styles.examName}>{exam.title}</Text>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>
                {resultData.totalScore}/{resultData.maxScore}
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Percentage</Text>
              <Text style={styles.scoreValue}>{resultData.percentage}%</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Status</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: statusColor, textTransform: "uppercase" },
                ]}
              >
                {resultData.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewResultBtn}
            onPress={() => navigation.navigate("Results")}
          >
            <Award color={COLORS.surface} size={20} />
            <Text style={styles.viewResultText}>View Detailed Result</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate("Main", { screen: "Exams" })}
          >
            <Text style={styles.backHomeText}>Back to Exams</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==================== EXAM QUESTIONS SCREEN ====================
  return (
    <View style={styles.screen}>
      {/* Header with Timer */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft color={COLORS.navy} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam.title}
          </Text>
        </View>
        <View
          style={[
            styles.timerBox,
            timeLeft < 60 && { backgroundColor: "#FEE2E2" },
          ]}
        >
          <Clock color={timeLeft < 60 ? COLORS.error : COLORS.blue} size={16} />
          <Text
            style={[styles.timerText, timeLeft < 60 && { color: COLORS.error }]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {exam.questions.map((q, index) => (
          <View key={q._id} style={styles.questionCard}>
            <Text style={styles.qNumber}>Q{index + 1}.</Text>
            <Text style={styles.qText}>{q.question}</Text>
            {q.questionHindi ? (
              <Text style={styles.qTextHindi}>{q.questionHindi}</Text>
            ) : null}

            {/* MCQ & True/False */}
            {(q.type === "MCQ" || q.type === "True / False") && (
              <View style={styles.optionsWrap}>
                {(q.type === "True / False"
                  ? ["True", "False"]
                  : q.options
                ).map((opt, i) => {
                  const isSelected = answers[q._id] === opt;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.optionBtn,
                        isSelected && styles.optionBtnSelected,
                      ]}
                      onPress={() => handleSelectOption(q._id, opt)}
                    >
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && {
                            color: COLORS.blue,
                            fontFamily: FONTS.medium,
                          },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Fill in the Blank & Written */}
            {(q.type === "Fill in the Blank" || q.type === "Written") && (
              <TextInput
                style={styles.textInput}
                placeholder="Type your answer here..."
                placeholderTextColor={COLORS.muted}
                value={answers[q._id] || ""}
                onChangeText={(text) => handleTextChange(q._id, text)}
                multiline={q.type === "Written"}
                numberOfLines={q.type === "Written" ? 4 : 1}
              />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <CheckCircle color={COLORS.surface} size={20} />
              <Text style={styles.submitBtnText}>Submit Exam</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    flex: 1,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.blue },

  // Exam Questions Styles
  content: { padding: SPACING.md, paddingBottom: 100 },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  qNumber: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.blue,
    marginBottom: 4,
  },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.ink,
    lineHeight: 24,
    marginBottom: 6,
  },
  qTextHindi: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 12,
  },
  optionsWrap: { marginTop: 10, gap: 10 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  optionBtnSelected: { borderColor: COLORS.blue, backgroundColor: "#EFF6FF" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.muted,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: COLORS.blue },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
  },
  optionText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.ink,
    flex: 1,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.ink,
    textAlignVertical: "top",
    marginTop: 10,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },

  // ==================== SUCCESS SCREEN STYLES ====================
  successCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    alignItems: "center",
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    color: COLORS.navy,
    marginBottom: 8,
  },
  examName: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 30,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
  },
  scoreBox: { alignItems: "center", flex: 1 },
  scoreLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
  },
  scoreValue: { fontFamily: FONTS.semiBold, fontSize: 20, color: COLORS.ink },
  viewResultBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    width: "100%",
    gap: 8,
    marginBottom: 12,
  },
  viewResultText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },
  backHomeBtn: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  backHomeText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.blue },
});
