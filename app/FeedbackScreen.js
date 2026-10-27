import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Star, Send, MessageSquare } from "lucide-react-native";
import { createUserFeedback, getMyFeedbacks } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadFeedbacks = async () => {
    try {
      const data = await getMyFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.log("Error loading feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      return Alert.alert("Error", "Please enter your feedback.");
    }

    try {
      setSubmitting(true);
      // Backend me averageRating calculate hota hai, par hum ek section bhejenge
      const payload = {
        curriculum: { overall: rating }, // Dummy structure backend requirement ke hisaab se
        overallComment: comment,
      };

      // Par backend ke hisaab se kuch fields specific hain, isliye simple payload bhej rahe hain
      // Maan lo backend me koi generic text field hai, agar nahi toh hum 'learning' section use karenge
      const genericPayload = {
        learning: { overall: rating, comment: comment },
      };

      await createUserFeedback(genericPayload);
      setComment("");
      setRating(5);
      Alert.alert("Success", "Feedback submitted successfully!");
      loadFeedbacks();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.mist }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.navy} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Give Your Feedback</Text>

          {/* Star Rating */}
          <Text style={styles.label}>Rate your experience</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Star
                  color={star <= rating ? "#F59E0B" : COLORS.line}
                  fill={star <= rating ? "#F59E0B" : "transparent"}
                  size={32}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Write your feedback</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us what you liked or how we can improve..."
            placeholderTextColor={COLORS.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitBtn, !comment.trim() && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={submitting || !comment.trim()}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <>
                <Send color={COLORS.surface} size={18} />
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Previous Feedbacks List */}
        <Text style={styles.sectionTitle}>My Previous Feedbacks</Text>

        {feedbacks.length === 0 ? (
          <View style={styles.emptyBox}>
            <MessageSquare color={COLORS.muted} size={48} />
            <Text style={styles.emptyText}>No feedbacks submitted yet.</Text>
          </View>
        ) : (
          feedbacks.map((item) => (
            <View key={item._id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      color={
                        star <= (item.averageRating || 5)
                          ? "#F59E0B"
                          : COLORS.line
                      }
                      fill={
                        star <= (item.averageRating || 5)
                          ? "#F59E0B"
                          : "transparent"
                      }
                      size={14}
                    />
                  ))}
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString("en-GB")}
                </Text>
              </View>

              {/* Backend ke hisaab se comment field alag ho sakti hai, hum 'learning.comment' ya 'overallComment' check kar rahe hain */}
              <Text style={styles.feedbackText}>
                {item.overallComment ||
                  item.learning?.comment ||
                  "Feedback submitted without comment."}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
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
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },

  content: { padding: SPACING.md, paddingBottom: 40 },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 8,
    marginTop: 10,
  },

  starsContainer: { flexDirection: "row", gap: 10, marginBottom: 10 },

  textInput: {
    backgroundColor: COLORS.mist,
    borderRadius: 8,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
    textAlignVertical: "top",
    height: 100,
    marginBottom: SPACING.md,
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

  emptyBox: { alignItems: "center", opacity: 0.5, marginTop: 20 },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 10 },

  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  dateText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  feedbackText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
    lineHeight: 20,
  },
});
