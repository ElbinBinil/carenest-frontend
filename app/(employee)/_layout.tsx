// app/(admin)/_layout.tsx
import { Slot, useRouter } from "expo-router";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabBarIcon } from "../../components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
export default function EmployeeLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function checkRole() {
      try {
        const token = await AsyncStorage.getItem("user");
        if (token) {
          const parsedToken = JSON.parse(token);
          if (parsedToken.role !== "Employee") {
            router.replace("/"); // Redirect if not admin
          }
        } else {
          router.replace("/"); // Redirect if no token
        }
      } catch (error) {
        console.error("Error checking role:", error);
        router.replace("/"); // Redirect on error
      }
    }
    checkRole();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About us",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="addChild"
        options={{ href: null }} // This hides it from the tab bar
      />
      <Tabs.Screen
        name="childDetail"
        options={{ href: null }} // This hides it from the tab bar
      />
      <Tabs.Screen
        name="childLog"
        options={{ href: null }} // This hides it from the tab bar
      />
      <Tabs.Screen
        name="foodLog"
        options={{ href: null }} // This hides it from the tab bar
      />
      <Tabs.Screen
        name="notices"
        options={{ href: null }} // This hides it from the tab bar
      />
    </Tabs>
  );
}
