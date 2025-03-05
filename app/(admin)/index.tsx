import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Pressable,
  ImageBackground,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CurrentDateDisplay from "@/components/WeekCalender";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
interface User {
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getUserData() {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    }
    getUserData();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.centerText}>Care Nest</Text>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: user ? user.profileImage : "https://via.placeholder.com/50",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user ? user.name : "Guest"}</Text>
            <Pressable style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        {/* <View style={styles.containerCal}> */}
        <CurrentDateDisplay />
        {/* </View> */}

        {/* Newsletter Section */}
        <Link href="/notices" asChild>
          <Pressable>
            <Text style={styles.newsletterTitle}>Notices</Text>
            <View style={styles.newsletterBox}>
              <Text style={styles.newsText}>• Employee Details Uploaded</Text>
              <Text style={styles.newsText}>• Orphan adopted</Text>
              <Text style={styles.newsText}>• Adoption form</Text>
              <Text style={styles.newsText}>• Please register now</Text>
            </View>
          </Pressable>
        </Link>

        {/* Options Section */}
        <Text style={styles.sectionTitle}>What are you looking for</Text>
        <View style={styles.optionsContainer}>
          <Link href="/empDetails" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="person" size={30} color="black" />
              <Text style={styles.optionText}>Employees</Text>
            </Pressable>
          </Link>
          <Link replace href="/childDetail" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="person-circle" size={30} color="black" />
              <Text style={styles.optionText}>Children detail</Text>
            </Pressable>
          </Link>
          <Link replace href="/foodInfo" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="fast-food" size={30} color="black" />
              <Text style={styles.optionText}>Meal</Text>
            </Pressable>
          </Link>
          <Link href="/empAttendance" asChild>
            <Pressable style={styles.optionButton2}>
              <Ionicons name="calendar" size={30} color="black" />
              <Text style={styles.optionText}>Attentance</Text>
            </Pressable>
          </Link>

          <Link replace href="/childLog" asChild>
            <Pressable style={styles.optionButton2}>
              <Ionicons name="calendar-number" size={30} color="black" />
              <Text style={styles.optionText}>Child Log</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white", marginTop: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6d6f5",
    padding: 8,
    borderRadius: 25,
    marginBottom: 12,
  },
  centerText: {
    fontSize: 24,
    textAlign: "center",
    padding: 4,
    marginBottom: 6,
    fontWeight: "condensed",
    // backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    color: "black",
    width: "100%",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileDetails: {
    marginLeft: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  signInButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 2,
    paddingHorizontal: 13,
    borderRadius: 8,
    marginTop: 4,
    marginRight: 140,
  },
  signInButtonText: {
    fontSize: 14,
    color: "#fff",
  },
  newsletterTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "purple",
    marginBottom: 8,
  },
  newsletterBox: { backgroundColor: "#e6d6f5", padding: 10, borderRadius: 10 },
  newsText: { fontSize: 14, marginBottom: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    width: "32%",
    backgroundColor: "#E5D1F2",
    alignItems: "center",
    padding: 17,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionButton2: {
    flex: 1,
    width: "40%",
    backgroundColor: "#E5D1F2",
    alignItems: "center",
    padding: 17,
    borderRadius: 10,
    marginBottom: 8,
    margin: 8,
  },
  optionText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  containerCal: {
    borderRadius: 20,
  },
});
