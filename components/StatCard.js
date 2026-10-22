import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function StatCard({ value, label, icon: Icon, iconColor }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.iconContainer}>
          {Icon && (
            <Icon
              color={iconColor || COLORS.blue}
              size={20}
              strokeWidth={1.5}
            />
          )}
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    justifyContent: "space-between",
    height: 115,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  value: {
    fontFamily: FONTS.semiBold,
    fontSize: 32,
    color: COLORS.navy,
    lineHeight: 36,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
