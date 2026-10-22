import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, ShieldCheck } from "lucide-react-native";
import { getUserProfile } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function IdCardScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  const initial = user?.nameEnglish
    ? user.nameEnglish.charAt(0).toUpperCase()
    : "";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SPACING.xl },
      ]}
    >
      <Text style={styles.pageTitle}>Digital ID Card</Text>

      <View style={styles.idCard}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RPSF DIGITAL</Text>
          <Text style={styles.headerSub}>Railway Protection Special Force</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.photoBox}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.photo} />
            ) : initial ? (
              <Text style={styles.initialText}>{initial}</Text>
            ) : (
              <User color={COLORS.muted} size={40} strokeWidth={1.5} />
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.name}>
              {user?.nameEnglish || "Member Name"}
            </Text>
            <Text style={styles.rank}>{user?.rank || "Rank"}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>User ID</Text>
              <Text style={styles.value}>{user?.rollNumber || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Father/Husband</Text>
              <Text style={styles.value} numberOfLines={1}>
                {user?.fatherNameEnglish || "-"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user?.mobileNumber || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{user?.bloodGroup || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Zone</Text>
              <Text style={styles.value}>{user?.zone || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <ShieldCheck color={COLORS.surface} size={16} strokeWidth={1.5} />
          <Text style={styles.footerText}>
            Authorized Digital Identity Card
          </Text>
        </View>
      </View>
    </ScrollView>
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
  content: { padding: SPACING.md },
  pageTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.navy,
    marginVertical: SPACING.md,
  },

  idCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.navy,
    borderRadius: RADIUS.card,
    overflow: "hidden",
    marginTop: SPACING.sm,
  },
  header: {
    backgroundColor: COLORS.navy,
    padding: SPACING.md,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.surface,
    letterSpacing: 1,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.blueLight,
    marginTop: 2,
  },

  body: { flexDirection: "row", padding: SPACING.md, gap: SPACING.md },
  photoBox: {
    width: 90,
    height: 110,
    borderRadius: 8,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  initialText: { fontFamily: FONTS.semiBold, fontSize: 32, color: COLORS.navy },

  infoBox: { flex: 1, justifyContent: "center" },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: 2,
  },
  rank: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.muted },
  value: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.ink,
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },

  footer: {
    flexDirection: "row",
    backgroundColor: COLORS.blue,
    padding: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
});
