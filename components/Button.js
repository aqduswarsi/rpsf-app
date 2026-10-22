import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";

export default function Button({ title, onPress, loading, disabled }) {
  const isInteractionDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.button, isInteractionDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.signal,
    height: 48,
    borderRadius: RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
});
