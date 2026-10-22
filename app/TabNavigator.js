import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, FileText, BookOpen, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // <-- Naya import
import { COLORS, FONTS } from "../constants/theme";

import HomeScreen from "./HomeScreen";
import ExamsScreen from "./ExamsScreen";
import SyllabusScreen from "./SyllabusScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator({ setAuth }) {
  const insets = useSafeAreaInsets(); // <-- Safe area check kiya

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.line,
          height: 60 + insets.bottom, // <-- Height badhayi
          paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 12, // <-- Padding set ki
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.navy,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Home color={color} size={20} strokeWidth={1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FileText color={color} size={20} strokeWidth={1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Syllabus"
        component={SyllabusScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <BookOpen color={color} size={20} strokeWidth={1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color }) => (
            <User color={color} size={20} strokeWidth={1.5} />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} setAuth={setAuth} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
