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
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, FileCheck } from "lucide-react-native";
import { getMyResults } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await getMyResults();
        setResults(data);
      } catch (err) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    if (status === "Pass") return "#15803D";
    if (status === "Fail") return COLORS.error;
    return "#B45309";
  };

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
      data={results}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Exam Results</Text>
          <Text style={styles.headerSub}>
            View your past performance and detailed reports.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <FileCheck color={COLORS.line} size={48} strokeWidth={1.5} />
          <Text style={styles.emptyText}>No results found.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("ResultDetail", { resultId: item._id })
          }
        >
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.examId?.title || "Exam"}</Text>
            <ChevronRight color={COLORS.muted} size={20} strokeWidth={1.5} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Score:{" "}
              <Text style={styles.value}>
                {item.totalScore}/{item.maxScore}
              </Text>
            </Text>
            <Text
              style={[styles.status, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>

          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted },
  value: { fontFamily: FONTS.medium, color: COLORS.ink },
  status: { fontFamily: FONTS.semiBold, fontSize: 13 },
  date: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  emptyContainer: { alignItems: "center", marginTop: SPACING.xl },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.md,
  },
});
