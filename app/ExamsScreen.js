import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  FileText,
  ChevronRight,
  Clock,
  HelpCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react-native";
import { getUserExams, submitReattemptRequest } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ExamsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reattempt Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadExams = async () => {
    try {
      const data = await getUserExams();
      setExams(data);
    } catch (err) {
      console.log("Error loading exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const openReattemptModal = (exam) => {
    setSelectedExam(exam);
    setReason("");
    setModalVisible(true);
  };

  const handleReattemptSubmit = async () => {
    if (!reason.trim()) {
      return Alert.alert("Error", "Please provide a reason for reattempt.");
    }

    try {
      setSubmitting(true);
      await submitReattemptRequest(selectedExam._id, reason);
      setModalVisible(false);
      Alert.alert(
        "Success",
        "Reattempt request submitted! Please wait for admin approval.",
      );
      loadExams(); // Refresh list
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading exams...
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const canAttempt = item.canAttempt;
    const requestStatus = item.requestStatus; // 'pending', 'approved', or null

    return (
      <View style={[styles.card, !canAttempt && { opacity: 0.8 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{item.step}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        <Text style={styles.desc} numberOfLines={2}>
          {item.description || item.courseName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.muted} />
            <Text style={styles.metaText}>{item.duration} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <HelpCircle size={14} color={COLORS.muted} />
            <Text style={styles.metaText}>{item.questionCount} Questions</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {canAttempt ? (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() =>
                navigation.navigate("ExamAttempt", { examId: item._id })
              }
            >
              <Text style={styles.startBtnText}>Start Exam</Text>
              <ChevronRight color={COLORS.surface} size={16} />
            </TouchableOpacity>
          ) : requestStatus === "pending" ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Reattempt Pending</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.reattemptBtn}
              onPress={() => openReattemptModal(item)}
            >
              <RotateCcw color={COLORS.blue} size={16} />
              <Text style={styles.reattemptBtnText}>Request Reattempt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Exams</Text>
        <Text style={styles.headerSub}>Select an exam to begin</Text>
      </View>

      {exams.length === 0 ? (
        <View style={styles.center}>
          <FileText color={COLORS.muted} size={48} />
          <Text style={styles.emptyText}>No exams available.</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Reattempt Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBg}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Reattempt</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={COLORS.muted} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Exam:{" "}
              <Text style={{ fontFamily: FONTS.semiBold }}>
                {selectedExam?.title}
              </Text>
            </Text>
            <Text style={styles.modalLabel}>Why do you want to reattempt?</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g., I was not feeling well, technical issue, etc."
              placeholderTextColor={COLORS.muted}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.submitBtn, !reason.trim() && { opacity: 0.5 }]}
              onPress={handleReattemptSubmit}
              disabled={submitting || !reason.trim()}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <>
                  <Send color={COLORS.surface} size={18} />
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 20, color: COLORS.navy },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },

  listContent: { padding: SPACING.md, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: COLORS.mist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stepText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.blue,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.ink,
    flex: 1,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
  },

  metaRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.muted },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    alignItems: "flex-end",
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.surface,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 12, color: "#92400E" },

  reattemptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: COLORS.blueLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reattemptBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.blue,
  },

  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 10,
  },

  // Modal Styles
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: { fontFamily: FONTS.semiBold, fontSize: 20, color: COLORS.navy },
  modalSub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.md,
  },
  modalLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.mist,
    borderRadius: 12,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
    textAlignVertical: "top",
    height: 100,
    marginBottom: SPACING.lg,
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
});
