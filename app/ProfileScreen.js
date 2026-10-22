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
} from "lucide-react-native";
import { getUserProfile, logout } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ProfileScreen({ setAuth }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuth(false);
  };

  const initial = user?.nameEnglish
    ? user.nameEnglish.charAt(0).toUpperCase()
    : "U";

  const menuItems = [
    {
      id: "account",
      title: "My Account",
      desc: "Update profile & details",
      icon: User,
    },
    {
      id: "idcard",
      title: "Digital ID Card",
      desc: "View your identity card",
      icon: CreditCard,
    },
    {
      id: "password",
      title: "Change Password",
      desc: "Update your login password",
      icon: Lock,
    },
    {
      id: "results",
      title: "My Results",
      desc: "View past exam results",
      icon: FileText,
    },
    {
      id: "support",
      title: "Support Tickets",
      desc: "Get help or raise a ticket",
      icon: Headphones,
    },
  ];

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
          Profile load ho rahi hai...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SPACING.lg },
      ]}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.nameEnglish || "Member"}</Text>
        <Text style={styles.rank}>
          {user?.rank || "Rank"} • {user?.rollNumber || "ID"}
        </Text>
      </View>

      {/* FETCHED DATA DISPLAY SECTION */}
      <Text style={styles.sectionTitle}>Personal Details</Text>
      <View style={styles.detailsContainer}>
        <DetailRow label="Name (Hindi)" value={user?.nameHindi} />
        <DetailRow label="Father's Name" value={user?.fatherNameEnglish} />
        <DetailRow label="Mother's Name" value={user?.motherNameEnglish} />

        <View style={styles.divider} />

        <DetailRow label="Mobile" value={user?.mobileNumber} />
        <DetailRow label="Email" value={user?.email} />
        <DetailRow
          label="Address"
          value={
            user?.presentAddress
              ? `${user.presentAddress}, ${user.state || ""} - ${user.presentPinCode || ""}`
              : "N/A"
          }
        />
        <DetailRow label="Blood Group" value={user?.bloodGroup} />
      </View>

      {/* Menu Options */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.id)}
            >
              <View style={styles.iconBox}>
                <Icon color={COLORS.blue} size={20} strokeWidth={1.5} />
              </View>
              <View style={styles.textBox}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <ChevronRight color={COLORS.muted} size={20} strokeWidth={1.5} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LogOut color={COLORS.error} size={20} strokeWidth={1.5} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Chhota component data line dikhane ke liye
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  content: { padding: SPACING.md },

  header: { alignItems: "center", marginVertical: SPACING.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarText: { fontFamily: FONTS.semiBold, fontSize: 32, color: COLORS.navy },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.navy,
    marginBottom: 4,
  },
  rank: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted },

  // Details Section Styles
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    marginLeft: 4,
  },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.muted,
    flex: 1,
  },
  detailValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.ink,
    flex: 2,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: SPACING.sm,
  },

  // Menu Styles
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    marginBottom: SPACING.lg,
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
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textBox: { flex: 1 },
  menuTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 2,
  },
  menuDesc: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.button,
    height: 48,
    gap: SPACING.sm,
  },
  logoutText: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.error },
});
