import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/theme";

const { width, height } = Dimensions.get("screen");

const BIG = width * 0.95;
const MEDIUM = width * 0.6;
const CORNER = width * 0.6;
const DOT = width * 0.14;

export default function Backdrop() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.circle,
          {
            width: MEDIUM,
            height: MEDIUM,
            borderRadius: MEDIUM / 2,
            top: -MEDIUM * 0.55,
            left: -MEDIUM * 0.3,
            backgroundColor: COLORS.blue,
          },
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: BIG,
            height: BIG,
            borderRadius: BIG / 2,
            top: -BIG * 0.7,
            right: -BIG * 0.35,
            backgroundColor: COLORS.blueLight,
          },
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: CORNER,
            height: CORNER,
            borderRadius: CORNER / 2,
            bottom: -CORNER * 0.45,
            left: -CORNER * 0.3,
            backgroundColor: COLORS.blue,
          },
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: DOT,
            height: DOT,
            borderRadius: DOT / 2,
            bottom: CORNER * 0.4,
            left: CORNER * 0.55,
            backgroundColor: COLORS.blueLight,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
  },
});
