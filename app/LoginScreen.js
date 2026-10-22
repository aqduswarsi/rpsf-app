import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { User, Lock } from "lucide-react-native";
import Backdrop from "../components/Backdrop";
import LogoHeader from "../components/LogoHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import { COLORS, FONTS, SPACING } from "../constants/theme";
import { login } from "../lib/api";

export default function LoginScreen({ setAuth }) {
  const passwordRef = useRef(null);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const handleLogin = async () => {
    setPhoneError("");
    setPasswordError("");
    setApiError("");

    if (!phone.trim()) {
      setPhoneError("Mobile Number is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
      setAuth(true);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Backdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoHeader />

          <View style={styles.form}>
            <Input
              label="Mobile Number"
              icon={User}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              error={phoneError}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="DDMMYYYY"
              secureTextEntry
              error={passwordError}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <Button title="Login" onPress={handleLogin} loading={loading} />
          </View>

          <Text style={styles.footer}>Official RPSF Member Portal</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.mist || "#F7F6F2",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    marginTop: SPACING.lg,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.blue || "#0B2545",
  },
  apiError: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingTop: SPACING.lg,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
  },
});
