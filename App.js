import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from "./app/LoginScreen";
import TabNavigator from "./app/TabNavigator";
import UpdateProfileScreen from "./app/UpdateProfileScreen";
import ChangePasswordScreen from "./app/ChangePasswordScreen";
import IdCardScreen from "./app/IdCardScreen";
import ResultsScreen from "./app/ResultsScreen";
import ResultDetailScreen from "./app/ResultDetailScreen";
import SupportScreen from "./app/SupportScreen";
import ExamAttemptScreen from "./app/ExamAttemptScreen";
import FeedbackScreen from "./app/FeedbackScreen";
import PdfViewerScreen from "./app/PdfViewerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [minimumSplashTimePassed, setMinimumSplashTimePassed] = useState(false);
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

  useEffect(() => {
    const timer = setTimeout(() => setMinimumSplashTimePassed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkToken() {
      try {
        const token = await AsyncStorage.getItem("rpsf_user_token");
        setIsLoggedIn(Boolean(token));
      } catch (error) {
        console.error("Failed to restore the login session:", error);
        setIsLoggedIn(false);
      } finally {
        setCheckingToken(false);
      }
    }

    checkToken();
  }, []);

  if (!fontsLoaded || checkingToken || !minimumSplashTimePassed) {
    return (
      <View style={styles.splash}>
        <Image
          source={require("./assets/splash-icon.png")}
          resizeMode="contain" // 👈 Crop nahi hoga, puri image dikhegi
          style={styles.splashImage}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setAuth={setIsLoggedIn} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main">
                {(props) => <TabNavigator {...props} setAuth={setIsLoggedIn} />}
              </Stack.Screen>

              <Stack.Screen
                name="UpdateProfile"
                component={UpdateProfileScreen}
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
              />
              <Stack.Screen name="IdCard" component={IdCardScreen} />
              <Stack.Screen name="Results" component={ResultsScreen} />
              <Stack.Screen
                name="ResultDetail"
                component={ResultDetailScreen}
              />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="ExamAttempt" component={ExamAttemptScreen} />
              <Stack.Screen name="Feedback" component={FeedbackScreen} />
              <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#ffffff", // Background color, agar upar/neeche space bache to yahan se fill hoga
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});
