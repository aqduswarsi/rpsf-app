import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Clock, ChevronLeft } from "lucide-react-native";
import { getExamById, submitUserExam } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ExamAttempt() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { examId } = route.params;

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadExam() {
      try {
        const data = await getExamById(examId);
        setExam(data);
        setTimeLeft(data.duration * 60);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
    return () => clearInterval(timerRef.current);
  }, [examId]);

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [exam]);

  useEffect(() => {
    if (timeLeft === 0 && exam && !submitting) handleSubmit();
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const payload = exam.questions.map((q) => ({
      questionId: q._id,
      userAnswer: answers[q._id] || "",
    }));
    try {
      await submitUserExam(examId, payload);
      navigation.goBack();
    } catch (err) {
      alert("Failed to submit: " + err.message);
      setSubmitting(false);
    }
  };

  const formatTime = (secs) =>
    `${Math.floor(secs / 60)
      .toString()
      .padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.ink} size={24} />
        </TouchableOpacity>
        <View style={styles.timerBox}>
          <Clock
            color={timeLeft <= 60 ? COLORS.error : COLORS.blue}
            size={18}
          />
          <Text
            style={[
              styles.timerText,
              timeLeft <= 60 && { color: COLORS.error },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
      >
        <Text style={styles.title}>{exam.title}</Text>
        {exam.questions.map((q, i) => (
          <View key={q._id} style={styles.card}>
            <Text style={styles.qText}>
              Q{i + 1}. {q.question}
            </Text>
            {q.type === "MCQ" ? (
              <View style={styles.options}>
                {(q.options || []).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.option,
                      answers[q._id] === opt && styles.optionActive,
                    ]}
                    onPress={() => setAnswers({ ...answers, [q._id]: opt })}
                  >
                    <Text
                      style={[
                        styles.optText,
                        answers[q._id] === opt && { color: COLORS.surface },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : q.type === "True / False" ? (
              <View style={styles.optionsRow}>
                {["True", "False"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.option,
                      answers[q._id] === opt && styles.optionActive,
                    ]}
                    onPress={() => setAnswers({ ...answers, [q._id]: opt })}
                  >
                    <Text
                      style={[
                        styles.optText,
                        answers[q._id] === opt && { color: COLORS.surface },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Type your answer..."
                value={answers[q._id] || ""}
                onChangeText={(text) =>
                  setAnswers({ ...answers, [q._id]: text })
                }
                multiline
              />
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Submitting..." : "Submit Exam"}
          </Text>
        </TouchableOpacity>
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
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.input,
  },
  timerText: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.blue },
  content: { padding: SPACING.md },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.navy,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  options: { gap: SPACING.sm },
  optionsRow: { flexDirection: "row", gap: SPACING.sm },
  option: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    padding: 12,
    flex: 1,
  },
  optionActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  optText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.navy,
    padding: 16,
    borderRadius: RADIUS.button,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  submitText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },
});
