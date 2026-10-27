import React, { useEffect, useState } from "react";
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
import ResultDetailScreen from "./app/ResultDetailScreen"; // 
import SupportScreen from "./app/SupportScreen";
import ExamAttemptScreen from "./app/ExamAttemptScreen";
import FeedbackScreen from "./app/FeedbackScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

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

  if (!fontsLoaded || checkingToken) return null;

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
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
