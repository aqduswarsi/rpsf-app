import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system"; // 👈 Naya File System API
import * as Sharing from "expo-sharing";
import { ChevronLeft, Download, FileText } from "lucide-react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function PdfViewerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { pdfUrl, title } = route.params;

  const [loading, setLoading] = useState(false);

  const handleOpenPdf = async () => {
    try {
      setLoading(true);

      if (pdfUrl && pdfUrl.startsWith("data:application/pdf;base64,")) {
        // Base64 string ko alag karo
        const base64Data = pdfUrl.split("base64,")[1];

        // Naye API se file banao (cache directory me)
        const file = new File(Paths.cache, `doc-${Date.now()}.pdf`);

        // Base64 data ko file me write karo
        file.write(base64Data, { encoding: "base64" });

        // File open/share karo
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Open PDF",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device.");
        }
      } else {
        Alert.alert("Error", "Invalid PDF format.");
      }
    } catch (error) {
      console.log("PDF Open Error:", error);
      Alert.alert("Error", "Could not open the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.navy} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || "PDF Document"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <FileText color={COLORS.blue} size={60} />
        </View>

        <Text style={styles.title}>{title || "Study Material"}</Text>
        <Text style={styles.subtitle}>
          Click the button below to open this PDF document securely on your
          device.
        </Text>

        <TouchableOpacity
          style={styles.openBtn}
          onPress={handleOpenPdf}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Download color={COLORS.surface} size={20} />
              <Text style={styles.openBtnText}>Open PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.mist },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.button,
    gap: 8,
    width: "100%",
  },
  openBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.surface,
  },
});
