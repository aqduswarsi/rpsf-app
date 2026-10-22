import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING } from "../constants/theme";
import logo from "../assets/rpsf-logo.png";

export default function LogoHeader() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: top + SPACING.lg }]}>
      <View style={styles.circle}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>RPSF</Text>
      <Text style={styles.subtitle}>Railway Protection Special Force</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  circle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    marginTop: SPACING.md,
    fontFamily: FONTS.semiBold,
    fontSize: 28,
    letterSpacing: 2,
    color: COLORS.navy,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
  },
});
