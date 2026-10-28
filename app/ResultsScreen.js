import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react-native";
import { getMyResults } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const filter = route.params?.filter || "All";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await getMyResults();

        let filteredData = data;
        if (filter === "Pass") {
          filteredData = data.filter((r) => r.status === "Pass");
        } else if (filter === "Fail") {
          filteredData = data.filter((r) => r.status === "Fail");
        } else if (filter === "pending") {
          filteredData = data.filter((r) => r.status === "pending");
        }

        setResults(filteredData);
      } catch (err) {
        console.log("Error loading results:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [filter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading results...
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const examTitle = item.examId?.title || item.courseId?.name || "Exam";

    let StatusIcon = Clock;
    let statusColor = "#D97706";
    if (item.status === "Pass") {
      StatusIcon = CheckCircle;
      statusColor = "#16A34A";
    } else if (item.status === "Fail") {
      StatusIcon = XCircle;
      statusColor = COLORS.error;
    }

    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.7}
        onPress={() =>
          // 👇 Yahan getParent() hata diya hai
          navigation.navigate("ResultDetail", { resultId: item._id })
        }
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconWrap}>
            <FileText color={COLORS.blue} size={20} />
          </View>
          <View>
            <Text style={styles.examTitle} numberOfLines={1}>
              {examTitle}
            </Text>
            <Text style={styles.dateText}>Date: {dateStr}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={styles.scoreWrap}>
            <Text style={styles.scoreText}>
              {item.totalScore}/{item.maxScore}
            </Text>
            <Text style={styles.percentageText}>{item.percentage}%</Text>
          </View>
          <View style={styles.statusWrap}>
            <StatusIcon color={statusColor} size={14} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
          <ChevronRight color={COLORS.muted} size={20} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {filter === "All" ? "My Exam Results" : `${filter} Results`}
        </Text>
        <Text style={styles.headerSub}>
          Total {results.length} attempt{results.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {results.length === 0 ? (
        <View style={styles.center}>
          <FileText color={COLORS.muted} size={48} />
          <Text style={styles.emptyText}>No results found.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  resultCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
    elevation: 1,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  examTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.ink,
    maxWidth: "80%",
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  scoreWrap: { alignItems: "flex-end" },
  scoreText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.ink },
  percentageText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted,
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 10,
  },
});
