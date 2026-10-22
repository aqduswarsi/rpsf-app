import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

const Input = forwardRef(function Input(
  {
    label,
    icon: Icon,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    autoCapitalize = "none",
    returnKeyType,
    onSubmitEditing,
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;
  const ToggleIcon = isPasswordVisible ? EyeOff : Eye;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        <Icon
          color={isFocused ? COLORS.blue : COLORS.muted}
          size={20}
          strokeWidth={1.5}
          style={styles.leftIcon}
        />
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
          >
            <ToggleIcon color={COLORS.muted} size={20} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.navy,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
  },
  inputWrapperFocused: {
    borderColor: COLORS.blue,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  leftIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: SPACING.sm + SPACING.xs,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.ink,
  },
  toggle: {
    height: "100%",
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  errorText: {
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
  },
});
