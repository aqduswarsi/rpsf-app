import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Lock, Eye, EyeOff } from "lucide-react-native";
import { changeUserPassword } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    if (newPassword.length < 6) {
      return Alert.alert(
        "Error",
        "Password must be at least 6 characters long.",
      );
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      setLoading(true);
      const res = await changeUserPassword(newPassword, confirmPassword);
      Alert.alert("Success", res.message || "Password updated successfully.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.mist }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft color={COLORS.navy} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconWrap}>
            <Lock color={COLORS.blue} size={40} />
          </View>
          <Text style={styles.heading}>Create New Password</Text>
          <Text style={styles.subHeading}>
            Your new password must be different from previously used passwords.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeIcon}
              >
                {showNew ? (
                  <EyeOff color={COLORS.muted} size={20} />
                ) : (
                  <Eye color={COLORS.muted} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeIcon}
              >
                {showConfirm ? (
                  <EyeOff color={COLORS.muted} size={20} />
                ) : (
                  <Eye color={COLORS.muted} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.saveBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.md },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },

  iconContainer: { alignItems: "center", marginVertical: SPACING.xl },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  heading: {
    fontFamily: FONTS.semiBold,
    fontSize: 22,
    color: COLORS.navy,
    marginBottom: 8,
  },
  subHeading: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },

  formContainer: { marginTop: SPACING.md },
  inputGroup: { marginBottom: SPACING.lg },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.ink,
  },
  eyeIcon: { padding: SPACING.xs },

  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  saveBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },
});
