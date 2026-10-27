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
import { useNavigation } from "@react-navigation/native";
import {
  User,
  CreditCard,
  Lock,
  FileText,
  Headphones,
  LogOut,
  ChevronRight,
  ChevronRight as ArrowRight,
  Newspaper,
  Award,
  AlertCircle,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react-native";
import {
  getUserProfile,
  logout,
  getDashboardStats,
  getMyResults,
  getLatestNews,
} from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ProfileScreen({ setAuth }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
  });
  const [results, setResults] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profileData, statsData, resultsData, newsData] =
          await Promise.allSettled([
            getUserProfile(),
            getDashboardStats(),
            getMyResults(),
            getLatestNews(),
          ]);

        if (profileData.status === "fulfilled") setUser(profileData.value);
        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (resultsData.status === "fulfilled") setResults(resultsData.value);
        if (newsData.status === "fulfilled") setNews(newsData.value);
      } catch (err) {
        console.log("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuth(false);
  };

  // App.js wali screens (Stack) ke liye getParent use karo
  const handleNavigate = (id) => {
    if (
      id === "UpdateProfile" ||
      id === "ChangePassword" ||
      id === "IdCard" ||
      id === "Results" ||
      id === "Support" ||
      id === "Feedback"
    ) {
      navigation.getParent()?.navigate(id);
    } else {
      navigation.navigate(id);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text
          style={{
            marginTop: 10,
            fontFamily: FONTS.regular,
            color: COLORS.muted,
          }}
        >
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const menuItems = [
    { id: "UpdateProfile", title: "Edit Profile", icon: User },
    { id: "IdCard", title: "Digital ID Card", icon: CreditCard },
    { id: "ChangePassword", title: "Change Password", icon: Lock },
    { id: "Results", title: "All Results", icon: FileText }, // 👈 Capital R
    { id: "Support", title: "Support Tickets", icon: Headphones },
    { id: "Feedback", title: "App Feedback", icon: Star },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SPACING.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>{user?.nameEnglish || "Member"}</Text>
          <Text style={styles.subHeaderText}>RPSF MEMBER DASHBOARD</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <LogOut color={COLORS.error} size={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Exams"
          count={stats.total}
          color={COLORS.blue}
          icon={FileText}
          onPress={() => handleNavigate("Results")} // 👈 Fix kiya
        />
        <StatCard
          title="Passed"
          count={stats.passed}
          color="#16A34A"
          icon={CheckCircle}
          onPress={() => handleNavigate("Results")}
        />
        <StatCard
          title="Failed"
          count={stats.failed}
          color={COLORS.error}
          icon={AlertCircle}
          onPress={() => handleNavigate("Results")}
        />
        <StatCard
          title="Pending"
          count={stats.pending}
          color="#D97706"
          icon={Clock}
          onPress={() => handleNavigate("Results")}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <User size={18} color={COLORS.navy} />
          <Text style={styles.sectionTitle}>My Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleNavigate("UpdateProfile")}
        >
          <ProfileRow label="Roll Number" value={user?.rollNumber} />
          <ProfileRow label="Name" value={user?.nameEnglish} />
          <ProfileRow label="Rank" value={user?.rank} />
          <ProfileRow label="Phone" value={user?.mobileNumber} />
          <ProfileRow label="Email" value={user?.email} />
          <ProfileRow label="Blood Group" value={user?.bloodGroup} />
          <ProfileRow label="Zone" value={user?.zone} isLast />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Award size={18} color={COLORS.navy} />
          <Text style={styles.sectionTitle}>Recent Results</Text>
        </View>
        {results.length === 0 ? (
          <Text style={styles.emptyText}>No recent results found.</Text>
        ) : (
          results.slice(0, 3).map((res) => {
            const dateStr = new Date(res.createdAt).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );
            const examTitle = res.examId?.title || res.courseId?.name || "Exam";
            return (
              <TouchableOpacity
                key={res._id}
                style={styles.resultCard}
                onPress={() =>
                  navigation
                    .getParent()
                    ?.navigate("ResultDetail", { resultId: res._id })
                }
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{examTitle}</Text>
                  <Text
                    style={[
                      styles.resultStatus,
                      {
                        color:
                          res.status === "Pass"
                            ? "#16A34A"
                            : res.status === "Fail"
                              ? COLORS.error
                              : "#D97706",
                      },
                    ]}
                  >
                    {res.status}
                  </Text>
                </View>
                <Text style={styles.resultScore}>
                  Score: {res.totalScore}/{res.maxScore} ({res.percentage}%) •{" "}
                  {dateStr}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Newspaper size={18} color={COLORS.navy} />
          <Text style={styles.sectionTitle}>Latest News</Text>
        </View>
        {news.length === 0 ? (
          <Text style={styles.emptyText}>No news available.</Text>
        ) : (
          news.slice(0, 3).map((item, idx) => (
            <View key={item._id || idx} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc} numberOfLines={2}>
                {item.description || item.content}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.id)}
              >
                <View style={styles.iconBox}>
                  <Icon color={COLORS.blue} size={20} strokeWidth={1.5} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <ChevronRight
                  color={COLORS.muted}
                  size={20}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const StatCard = ({ title, count, color, icon: Icon, onPress }) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.statIconWrap, { backgroundColor: `${color}15` }]}>
      <Icon color={color} size={20} />
    </View>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={styles.statFooter}>
      <Text style={[styles.statView, { color }]}>View</Text>
      <ArrowRight color={color} size={12} />
    </View>
  </TouchableOpacity>
);

const ProfileRow = ({ label, value, isLast }) => (
  <View style={[styles.profileRow, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.profileLabel}>{label}</Text>
    <Text style={styles.profileValue}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  content: { padding: SPACING.md },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  welcomeText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted },
  nameText: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.navy,
    marginTop: 2,
  },
  subHeaderText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.blue,
    letterSpacing: 1,
    marginTop: 4,
  },
  logoutIcon: { padding: 8, backgroundColor: "#FEF2F2", borderRadius: 8 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statCount: { fontFamily: FONTS.semiBold, fontSize: 24, color: COLORS.ink },
  statTitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  statView: { fontFamily: FONTS.medium, fontSize: 12 },
  sectionContainer: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  profileLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.muted },
  profileValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.ink,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  resultTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.ink,
    flex: 1,
  },
  resultStatus: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  resultScore: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  newsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  newsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 4,
  },
  newsDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.ink,
    flex: 1,
  },
});
