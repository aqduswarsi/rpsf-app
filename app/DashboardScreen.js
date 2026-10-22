import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  FileText,
  Headphones,
  ShieldCheck,
  User,
  LogOut,
  Shield,
} from "lucide-react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { logout, getUserProfile, getDashboardStats } from "../lib/api";

const MENU_ITEMS = [
  {
    id: "profile",
    title: "My Account",
    desc: "Update profile & ID card",
    icon: User,
  },
  {
    id: "course",
    title: "My Course",
    desc: "Read study material",
    icon: BookOpen,
  },
  {
    id: "exam",
    title: "Exams",
    desc: "Attempt available exams",
    icon: FileText,
  },
  {
    id: "result",
    title: "Exam Results",
    desc: "View your performance",
    icon: ShieldCheck,
  },
  {
    id: "support",
    title: "Support",
    desc: "Raise a support ticket",
    icon: Headphones,
  },
];

export default function DashboardScreen({ setAuth }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getUserProfile();
        const statsData = await getDashboardStats();
        setUser(userData);
        setStats(statsData);
      } catch (err) {
        console.log("Dashboard load error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuth(false);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "";

  return (
    <View style={styles.screen}>
      {/* TopStrip Inlined */}
      <View style={styles.topStrip}>
        <Shield color={COLORS.surface} size={20} strokeWidth={1.5} />
        <Text style={styles.topStripTitle}>RPSF</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.navy}
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            <View style={styles.topRow}>
              {/* DashboardHeader Inlined */}
              <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                  {user?.photo ? (
                    <Image source={{ uri: user.photo }} style={styles.avatar} />
                  ) : initial ? (
                    <Text style={styles.initialText}>{initial}</Text>
                  ) : (
                    <User color={COLORS.muted} size={24} strokeWidth={1.5} />
                  )}
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name || "Member"}
                  </Text>
                  <Text style={styles.userRank}>{user?.rank || "User"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut color={COLORS.error} size={20} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Exams</Text>
                </View>
                <View style={styles.statBox}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: COLORS.success || "#15803D" },
                    ]}
                  >
                    {stats.passed}
                  </Text>
                  <Text style={styles.statLabel}>Passed</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: COLORS.error }]}>
                    {stats.failed}
                  </Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Quick Links</Text>

            <View style={styles.grid}>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconBox}>
                      <Icon color={COLORS.navy} size={20} strokeWidth={1.5} />
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  topStrip: {
    backgroundColor: COLORS.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  topStripTitle: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    letterSpacing: 2,
    marginLeft: SPACING.sm,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.paper,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    marginRight: SPACING.sm,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  initialText: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.navy,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: 2,
  },
  userRank: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
  },
  logoutBtn: {
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surface,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    color: COLORS.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: SPACING.md,
  },
  grid: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.paper,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
  },
});
