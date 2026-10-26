import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { getUserProfile, updateUserProfile } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function UpdateProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nameEnglish: "",
    nameHindi: "",
    fatherNameEnglish: "",
    fatherNameHindi: "",
    motherNameEnglish: "",
    motherNameHindi: "",
    alternateMobile: "",
    mobileWhatsapp: "N",
    alternateWhatsapp: "N",
    email: "",
    presentAddress: "",
    presentPinCode: "",
    permanentAddress: "",
    permanentPinCode: "",
    state: "",
    bloodGroup: "",
    religion: "",
    category: "",
    caste: "",
    photo: "", // Base64 photo store karne ke liye
    mobileNumber: "",
  });

  // 1. Data Fetch karo
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --- Photo Picker (Base64) ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission Denied", "We need access to your photos.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Quality thodi kam rakhi taaki base64 lamba na ho aur backend crash na kare
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Base64 ko form me save karo
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setForm((prev) => ({ ...prev, photo: base64Image }));
    }
  };

  // 2. Data Save karo
  const handleSave = async () => {
    if (!form.nameEnglish.trim()) {
      return Alert.alert("Error", "Name (English) is required.");
    }

    for (const field of ["presentPinCode", "permanentPinCode"]) {
      if (form[field] && !/^\d{6}$/.test(form[field])) {
        return Alert.alert("Error", `${field} must be 6 digits.`);
      }
    }

    try {
      setSaving(true);
      const payload = { ...form };
      delete payload.mobileNumber; // Phone number cannot be updated

      const res = await updateUserProfile(payload);
      Alert.alert("Success", res.message || "Profile updated successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading form...
        </Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Update Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PHOTO SECTION */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.profilePhoto} />
            ) : (
              <Camera color={COLORS.muted} size={32} />
            )}
            <View style={styles.cameraIconWrap}>
              <Camera color={COLORS.surface} size={14} />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoText}>Tap to change profile photo</Text>
        </View>

        {/* NAME SECTION */}
        <Text style={styles.sectionTitle}>Name & Parents Name</Text>
        <InputField
          label="Name (English)"
          value={form.nameEnglish}
          onChange={(v) => handleChange("nameEnglish", v)}
        />
        <InputField
          label="Name (Hindi)"
          value={form.nameHindi}
          onChange={(v) => handleChange("nameHindi", v)}
        />
        <InputField
          label="Father's Name (English)"
          value={form.fatherNameEnglish}
          onChange={(v) => handleChange("fatherNameEnglish", v)}
        />
        <InputField
          label="Father's Name (Hindi)"
          value={form.fatherNameHindi}
          onChange={(v) => handleChange("fatherNameHindi", v)}
        />
        <InputField
          label="Mother's Name (English)"
          value={form.motherNameEnglish}
          onChange={(v) => handleChange("motherNameEnglish", v)}
        />
        <InputField
          label="Mother's Name (Hindi)"
          value={form.motherNameHindi}
          onChange={(v) => handleChange("motherNameHindi", v)}
        />

        {/* CONTACT SECTION */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InputField
          label="Mobile Number (Cannot be changed)"
          value={form.mobileNumber}
          editable={false}
        />

        <ToggleField
          label="Mobile WhatsApp"
          value={form.mobileWhatsapp}
          onChange={(v) => handleChange("mobileWhatsapp", v)}
        />
        <InputField
          label="Alternate Mobile"
          value={form.alternateMobile}
          onChange={(v) => handleChange("alternateMobile", v)}
          keyboardType="phone-pad"
        />
        <ToggleField
          label="Alternate WhatsApp"
          value={form.alternateWhatsapp}
          onChange={(v) => handleChange("alternateWhatsapp", v)}
        />
        <InputField
          label="Email ID"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
          keyboardType="email-address"
        />

        {/* ADDRESS SECTION */}
        <Text style={styles.sectionTitle}>Address</Text>
        <InputField
          label="Present Address"
          value={form.presentAddress}
          onChange={(v) => handleChange("presentAddress", v)}
          multiline
        />
        <InputField
          label="Present Pin Code"
          value={form.presentPinCode}
          onChange={(v) => handleChange("presentPinCode", v)}
          keyboardType="number-pad"
          maxLength={6}
        />
        <InputField
          label="Permanent Address"
          value={form.permanentAddress}
          onChange={(v) => handleChange("permanentAddress", v)}
          multiline
        />
        <InputField
          label="Permanent Pin Code"
          value={form.permanentPinCode}
          onChange={(v) => handleChange("permanentPinCode", v)}
          keyboardType="number-pad"
          maxLength={6}
        />
        <InputField
          label="State"
          value={form.state}
          onChange={(v) => handleChange("state", v)}
        />

        {/* OTHER SECTION */}
        <Text style={styles.sectionTitle}>Other Details</Text>
        <InputField
          label="Blood Group"
          value={form.bloodGroup}
          onChange={(v) => handleChange("bloodGroup", v)}
        />
        <InputField
          label="Religion"
          value={form.religion}
          onChange={(v) => handleChange("religion", v)}
        />
        <InputField
          label="Category"
          value={form.category}
          onChange={(v) => handleChange("category", v)}
        />
        <InputField
          label="Caste"
          value={form.caste}
          onChange={(v) => handleChange("caste", v)}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ----- Reusable Components -----
const InputField = ({
  label,
  value,
  onChange,
  multiline,
  keyboardType,
  editable = true,
  maxLength,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && { height: 80, textAlignVertical: "top" },
        !editable && { backgroundColor: "#E5E7EB", color: COLORS.muted },
      ]}
      value={value ? String(value) : ""}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      editable={editable}
      placeholder={label}
      placeholderTextColor={COLORS.muted}
      maxLength={maxLength}
    />
  </View>
);

const ToggleField = ({ label, value, onChange }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.toggleOptions}>
      {["Y", "N"].map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.toggleBtn, value === opt && styles.toggleActive]}
        >
          <Text
            style={{
              color: value === opt ? COLORS.surface : COLORS.ink,
              fontFamily: FONTS.medium,
            }}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ----- Styles -----
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
  content: { paddingHorizontal: SPACING.md },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },

  // Photo Section
  photoContainer: { alignItems: "center", marginVertical: SPACING.md },
  photoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profilePhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  cameraIconWrap: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.blue,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  photoText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.blue,
    marginTop: 8,
  },

  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.ink,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    paddingVertical: 4,
  },
  toggleOptions: { flexDirection: "row", gap: SPACING.sm },
  toggleBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  toggleActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },

  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  saveBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },
});
