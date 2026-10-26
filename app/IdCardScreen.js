import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Shield,
  Camera,
  Printer,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy"; // 👈 FIX: legacy import
import { Asset } from "expo-asset";
import { getUserProfile, updateUserProfile } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

// Logo ko local asset se base64 me convert karne ka helper
const getLogoBase64 = async () => {
  try {
    const asset = Asset.fromModule(require("../assets/rpsf-logo.png"));
    await asset.downloadAsync();

    const base64 = await FileSystem.readAsStringAsync(
      asset.localUri || asset.uri,
      { encoding: "base64" },
    );
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.log("Logo base64 error:", error);
    return "";
  }
};

export default function IdCardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);

  // Print me logo dikhane ke liye base64 state
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();

    getLogoBase64().then((b64) => {
      if (b64) setLogoBase64(b64);
    });
  }, []);

  // --- Photo Picker ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission Denied",
        "We need access to your photos to update the ID card.",
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUser((prev) => ({
        ...prev,
        photo: result.assets[0].uri,
        photoBase64: result.assets[0].base64,
      }));
      setPhotoChanged(true);
    }
  };

  // --- Handle Submit Photo to Backend ---
  const handleUpdatePhoto = async () => {
    if (!user?.photoBase64) {
      return Alert.alert("No Photo", "Please choose a new photo first.");
    }

    try {
      setSaving(true);
      const dataUri = `data:image/jpeg;base64,${user.photoBase64}`;
      await updateUserProfile({ photo: dataUri });

      setUser((prev) => ({ ...prev, photo: dataUri }));
      setPhotoChanged(false);
      Alert.alert("Success", "Photo saved to your Digital ID!");
    } catch (err) {
      console.log("Photo save error:", err);
      Alert.alert("Error", err.message || "Could not save photo.");
    } finally {
      setSaving(false);
    }
  };

  // --- Print Logic ---
  const handlePrint = async () => {
    try {
      let finalPhotoUri = "";

      if (user?.photoBase64) {
        finalPhotoUri = `data:image/jpeg;base64,${user.photoBase64}`;
      } else if (user?.photo) {
        if (user.photo.startsWith("data:")) {
          finalPhotoUri = user.photo;
        } else if (user.photo.startsWith("http")) {
          finalPhotoUri = user.photo;
        }
      }

      // Agar logo abhi tak load nahi hua to print se pehle dobara load karo
      let logo = logoBase64;
      if (!logo) {
        logo = await getLogoBase64();
        if (logo) setLogoBase64(logo);
      }

      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; text-align: center; }
              .card { border: 2px solid #1e3a8a; border-radius: 16px; overflow: hidden; max-width: 400px; margin: auto; }
              .header { background: #1e3a8a; color: white; padding: 20px; display: flex; flex-direction: column; align-items: center; }
              .header-logo { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #D4AF37; margin-bottom: 10px; background: white; object-fit: contain; padding: 5px; display: block; }
              .body { padding: 20px; }
              .footer { background: #1e3a8a; color: white; padding: 10px; font-size: 12px; border-top: 3px solid #D4AF37; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
              .label { font-weight: bold; color: #1e3a8a; }
              .photo { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #D4AF37; margin: 10px auto; object-fit: cover; display: block; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                ${logo ? `<img src="${logo}" class="header-logo" />` : ""}
                <h2>RPSF DIGITAL</h2>
                <p style="font-size: 10px; margin: 0;">Railway Protection Special Force</p>
              </div>
              <div class="body">
                ${finalPhotoUri ? `<img src="${finalPhotoUri}" class="photo" />` : ""}
                <h2 style="color: #1e3a8a; margin: 5px 0;">${user?.nameEnglish?.toUpperCase() || "MEMBER"}</h2>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase;">${user?.rank || "RPSF Member"}</p>
                <hr style="border: 1px dashed #d1d5db; margin: 15px 0;" />
                <div class="row"><span class="label">User ID</span><span>${user?.rollNumber || user?.mobileNumber || "—"}</span></div>
                <div class="row"><span class="label">Father/Husband</span><span>${user?.fatherNameEnglish || "—"}</span></div>
                <div class="row"><span class="label">Phone</span><span>${user?.mobileNumber || "—"}</span></div>
                <div class="row"><span class="label">Email</span><span>${user?.email || "—"}</span></div>
                <div class="row"><span class="label">Location</span><span>${[user?.presentAddress, user?.state].filter(Boolean).join(", ") || "—"}</span></div>
              </div>
              <div class="footer">
                Authorized Digital Identity Card
              </div>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not generate print document.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading ID Card...
        </Text>
      </View>
    );
  }

  const fullLocation =
    [user?.presentAddress, user?.state].filter(Boolean).join(", ") || "—";

  return (
    <ScrollView
      style={styles.screen}
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
        <Text style={styles.headerTitle}>Digital ID Card</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Action Box */}
      <View style={styles.actionBox}>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Camera color={COLORS.blue} size={20} />
          <Text style={styles.uploadBtnText}>Choose New Profile Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.updateBtn,
            (!photoChanged || saving) && { opacity: 0.6 },
          ]}
          onPress={handleUpdatePhoto}
          disabled={!photoChanged || saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.updateBtnText}>Update Digital ID</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ==================== ID CARD ==================== */}
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/rpsf-logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.cardHeaderTitle}>RPSF DIGITAL</Text>
          <Text style={styles.cardHeaderSub}>
            Railway Protection Special Force
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.photoWrap}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.photo} />
            ) : (
              <Image
                source={require("../assets/rpsf-logo.png")}
                style={styles.photoPlaceholder}
              />
            )}
          </View>

          <Text style={styles.userName}>
            {user?.nameEnglish?.toUpperCase() || "MEMBER"}
          </Text>
          <Text style={styles.userRank}>{user?.rank || "RPSF Member"}</Text>

          <View style={styles.dashedDivider} />

          <View style={styles.detailsWrap}>
            <DetailRow
              icon={FileText}
              label="User ID"
              value={user?.rollNumber || user?.mobileNumber || "—"}
            />
            <DetailRow
              icon={User}
              label="Father/Husband"
              value={user?.fatherNameEnglish || "—"}
            />
            <DetailRow
              icon={Phone}
              label="Phone"
              value={user?.mobileNumber || "—"}
            />
            <DetailRow icon={Mail} label="Email" value={user?.email || "—"} />
            <DetailRow icon={MapPin} label="Location" value={fullLocation} />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Shield color={COLORS.surface} size={16} />
          <Text style={styles.cardFooterText}>
            Authorized Digital Identity Card
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
        <Printer color={COLORS.surface} size={18} />
        <Text style={styles.printBtnText}>Print ID Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Detail Row Component
const DetailRow = ({ icon: Icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Icon size={16} color={COLORS.navy} style={{ marginRight: 8 }} />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  content: { paddingHorizontal: SPACING.md },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },
  actionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    marginBottom: 12,
  },
  uploadBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.blue,
  },
  updateBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  updateBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: SPACING.xl,
  },
  cardHeader: {
    backgroundColor: COLORS.navy,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#D4AF37",
    elevation: 4,
  },
  logo: { width: 60, height: 60, resizeMode: "contain" },
  cardHeaderTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.surface,
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardHeaderSub: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  cardBody: {
    padding: 24,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  photoWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#D4AF37",
    marginBottom: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { width: 60, height: 60, resizeMode: "contain" },
  userName: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    color: COLORS.navy,
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: "center",
  },
  userRank: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  dashedDivider: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  detailsWrap: { width: "100%", gap: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.navy },
  rowValue: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: "#374151",
    maxWidth: "60%",
    textAlign: "right",
  },
  cardFooter: {
    backgroundColor: COLORS.navy,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 3,
    borderTopColor: "#D4AF37",
  },
  cardFooterText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  printBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.blueLight,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    gap: 8,
  },
  printBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.surface,
  },
});
