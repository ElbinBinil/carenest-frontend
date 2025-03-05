// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash screen visible while we check auth
        if (loaded) {
          // Check authentication before hiding splash screen
          const token = await AsyncStorage.getItem("user");

          if (token) {
            const parsedToken = JSON.parse(token);
            if (parsedToken.role === "Admin") {
              router.replace("/(admin)");
            } else if (parsedToken.role === "Employee") {
              router.replace("/(employee)");
            } else {
              router.replace("/");
            }
          } else {
            router.replace("/");
          }

          // Only hide splash screen after auth check and routing decision
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
        router.replace("/");
        await SplashScreen.hideAsync();
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, [loaded, router]);

  // Don't render anything until we're ready
  if (!loaded || !isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Care Nest", headerShown: false }}
          />
          <Stack.Screen
            name="signin"
            options={{ title: "Signin", headerShown: false }}
          />
          <Stack.Screen
            name="(admin)"
            options={{ title: "Admin", headerShown: false }}
          />
          <Stack.Screen
            name="(employee)"
            options={{ title: "Employee", headerShown: false }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
