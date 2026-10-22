import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
// Imports sirf ek baar
import {
  Shield,
  Heart,
  ShieldAlert,
  Search,
  Users,
  Monitor,
  PhoneCall,
  AlertCircle,
} from "lucide-react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

const { width } = Dimensions.get("window");

const stats = [
  { label: "Personnel", value: 75000, suffix: "+" },
  { label: "Zones Covered", value: 18, suffix: "" },
  { label: "Arrests (2024)", value: 12000, suffix: "+" },
  { label: "Children Rescued", value: 87000, suffix: "+" },
];

const services = [
  {
    icon: Shield,
    title: "Railway Security",
    desc: "Protecting passengers and railway property across 18 zones.",
  },
  {
    icon: Heart,
    title: "Meri Saheli",
    desc: "Dedicated women safety initiative ensuring safe travel.",
  },
  {
    icon: ShieldAlert,
    title: "Crime Prevention",
    desc: "Swift action against theft, trespassing, and anti-social elements.",
  },
  {
    icon: Search,
    title: "Lost & Found",
    desc: "Comprehensive lost article tracking system for passengers.",
  },
  {
    icon: Users,
    title: "Child Rescue",
    desc: "Operation NANHE FARISHTE rescuing trafficked children.",
  },
  {
    icon: Monitor,
    title: "Cyber Cell",
    desc: "Dedicated cyber crime cells to tackle digital threats.",
  },
];

// Local Images Path
const HERO_IMAGES = [
  require("../assets/hero1.jpg"),
  require("../assets/hero2.jpg"),
];

// --- Animated Counter ---
function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        clearInterval(timer);
        setCount(target);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <Text style={styles.statNumber}>
      {count.toLocaleString()}
      {suffix}
    </Text>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);

  // Auto Slider Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  const handleCall = () => {
    Linking.openURL("tel:182");
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
    >
      {/* HERO SLIDER */}
      <View style={styles.heroSection}>
        <FlatList
          ref={flatListRef}
          data={HERO_IMAGES}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => (
            <Image source={item} style={styles.heroImage} />
          )}
        />

        {/* Dark Overlay for text readability */}
        <View style={styles.heroOverlay} />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>🇮🇳 Ministry of Railways</Text>

          {/* Logo Placeholder */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/rpsf-logo.png")}
              style={styles.heroLogo}
            />
          </View>

          <Text style={styles.heroTitleMain}>RPSF</Text>
          <Text style={styles.heroTitleSub}>
            TRAINING CENTER RAJAHI CAMP GORAKHPUR
          </Text>
          <Text style={styles.heroTagline}>
            RAILWAY PROTECTION SPECIAL FORCE
          </Text>
        </View>

        {/* Slider Dots */}
        <View style={styles.sliderDots}>
          {HERO_IMAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.sliderDot,
                currentSlide === index && styles.sliderDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* STATS SECTION */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View style={styles.statCard} key={i}>
              <AnimatedCounter target={s.value} suffix={s.suffix} />
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ABOUT BANNER */}
      <View style={styles.aboutBanner}>
        <Text style={styles.sectionEyebrow}>WHO WE ARE</Text>
        <Text style={styles.sectionTitle}>Guardians of Indian Railways</Text>

        <Text style={styles.aboutText}>
          The RPSF TRAINING CENTER RAJAHI CAMP GORAKHPUR is India's elite armed
          force dedicated to protecting railway passengers, property, and
          assets. Operating across{" "}
          <Text style={{ fontWeight: "bold" }}>18 zonal railways</Text>.
        </Text>

        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 16 }]}>
          <Text style={styles.btnText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* SERVICES SECTION */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionEyebrow}>WHAT WE DO</Text>
        <Text style={styles.sectionTitle}>Our Services</Text>

        <View style={styles.servicesGrid}>
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <View style={styles.serviceCard} key={i}>
                <View style={styles.serviceIconWrap}>
                  <Icon color={COLORS.blue} size={28} />
                </View>
                <Text style={styles.serviceTitle}>{svc.title}</Text>
                <Text style={styles.serviceDesc}>{svc.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* EMERGENCY BANNER */}
      <View style={styles.emergencySection}>
        <View style={styles.emergencyHeader}>
          <AlertCircle color="#DC2626" size={20} />
          <Text style={styles.emergencyTitle}>Emergency Helpline</Text>
        </View>

        <View style={styles.emergencyBody}>
          <View>
            <Text style={styles.emergencyNumber}>182</Text>
            <Text style={styles.emergencyDesc}>
              24×7 Railway Security Support
            </Text>
          </View>

          <TouchableOpacity style={styles.btnEmergency} onPress={handleCall}>
            <PhoneCall color={COLORS.surface} size={16} />
            <Text style={styles.btnEmergencyText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.mist },

  // Hero Section
  heroSection: { height: 450, width: "100%", position: "relative" },
  heroImage: { width: width, height: 450, resizeMode: "cover" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 37, 69, 0.7)",
  },
  heroContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  heroBadge: {
    color: COLORS.surface,
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  logoWrap: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    padding: 10,
    overflow: "hidden",
  },
  heroLogo: { width: "100%", height: "100%", resizeMode: "contain" },
  heroTitleMain: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    fontSize: 36,
    letterSpacing: 2,
  },
  heroTitleSub: {
    color: COLORS.surface,
    fontFamily: FONTS.regular,
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 1,
  },
  heroTagline: {
    color: COLORS.surface,
    fontFamily: FONTS.medium,
    fontSize: 18,
    marginTop: 16,
  },
  heroActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  btnPrimary: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  btnText: { color: COLORS.surface, fontFamily: FONTS.semiBold, fontSize: 14 },
  btnOutline: {
    borderWidth: 1,
    borderColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  btnOutlineText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },

  sliderDots: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 8,
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  sliderDotActive: { backgroundColor: COLORS.surface, width: 24 },

  // Stats Section
  statsSection: { padding: SPACING.md, marginTop: -30 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.card,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: { width: "48%", alignItems: "center", marginVertical: 12 },
  statNumber: { fontFamily: FONTS.semiBold, fontSize: 22, color: COLORS.navy },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  // About Section
  aboutBanner: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.md,
  },
  sectionEyebrow: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.blueLight,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    color: COLORS.navy,
    textAlign: "center",
    marginBottom: 16,
  },
  aboutText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
    textAlign: "center",
  },

  // Services Section
  servicesSection: { padding: SPACING.md },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.card,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  serviceIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.mist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.navy,
    marginBottom: 6,
  },
  serviceDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
  },

  // Emergency Section New Design
  emergencySection: {
    margin: SPACING.md,
    backgroundColor: "#FFF",
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: SPACING.xl,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FEF2F2",
    paddingBottom: 12,
  },
  emergencyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#991B1B",
  },
  emergencyBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emergencyNumber: {
    fontFamily: FONTS.semiBold,
    fontSize: 32,
    color: "#DC2626",
    lineHeight: 36,
  },
  emergencyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: "#991B1B",
    marginTop: 4,
  },
  btnEmergency: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    gap: 8,
  },
  btnEmergencyText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
});
