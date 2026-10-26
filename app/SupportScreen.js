import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Send, Ticket, CheckCircle } from "lucide-react-native";
import { getMyTickets, createUserTicket } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState("");

  const loadTickets = async () => {
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.log("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) {
      return Alert.alert("Error", "Please enter your question.");
    }

    try {
      setSubmitting(true);
      await createUserTicket(question);
      setQuestion("");
      Alert.alert("Success", "Ticket submitted successfully!");
      loadTickets(); // Refresh list
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit ticket.");
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

  const renderItem = ({ item }) => {
    const isAnswered = item.status === "answered";
    const dateStr = new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isAnswered ? "#DCFCE7" : "#FEF3C7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isAnswered ? "#166534" : "#92400E" },
              ]}
            >
              {isAnswered ? "Answered" : "Pending"}
            </Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <Text style={styles.qText}>{item.question}</Text>

        {isAnswered && item.answer && (
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>Admin Reply:</Text>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.mist }}
      behavior={Platform.OS === "ios" ? "padding" : "height" }
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.navy} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ticket color={COLORS.muted} size={48} />
            <Text style={styles.emptyText}>No tickets raised yet.</Text>
          </View>
        }
      />

      {/* Input Area */}
      <View
        style={[styles.inputWrapper, { paddingBottom: insets.bottom + 10 }]}
      >
        <TextInput
          style={styles.input}
          placeholder="Type your question here..."
          placeholderTextColor={COLORS.muted}
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !question.trim() && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting || !question.trim()}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <Send color={COLORS.surface} size={20} />
          )}
        </TouchableOpacity>
      </View>
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

  listContent: { padding: SPACING.md, paddingBottom: 20, flexGrow: 1 },

  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
  },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.ink,
    lineHeight: 22,
  },
  answerBox: {
    backgroundColor: "#F9FAFB",
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#16A34A",
  },
  answerLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "#16A34A",
    marginBottom: 4,
  },
  answerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  emptyText: { fontFamily: FONTS.regular, fontSize: 16, marginTop: 10 },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.mist,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
});
