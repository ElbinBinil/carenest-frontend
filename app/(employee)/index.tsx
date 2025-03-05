import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CurrentDateDisplay from "@/components/WeekCalender";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";

interface User {
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

interface Notice {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loadingCheckInOut, setLoadingCheckInOut] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getUserData() {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser: User = JSON.parse(userData);
          setUser(parsedUser);
          if (parsedUser.profileImage) {
            fetchProfileImage(parsedUser.profileImage);
          }
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    }
    getUserData();

    async function fetchNotices() {
      setLoadingNotices(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Authentication token missing.");
          return;
        }

        const response = await axios.get(API_ENDPOINTS.LATEST_NOTICE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.data) {
          setNotices(response.data.data);
        } else {
          console.error("Failed to fetch notices:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoadingNotices(false);
      }
    }
    fetchNotices();
  }, []);

  const fetchProfileImage = useCallback(async (objectUrl: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.GET_FILE,
        { objectUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.signedUrl) {
        setProfileImageUrl(response.data.signedUrl);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch profile image."
        );
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
      Alert.alert("Error", "Failed to fetch profile image.");
    }
  }, []);

  const handleCheckIn = async () => {
    setLoadingCheckInOut(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }
      const response = await axios.post(
        isCheckedIn ? API_ENDPOINTS.CHECK_OUT : API_ENDPOINTS.CHECK_IN,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setIsCheckedIn(!isCheckedIn);
        Alert.alert(
          "Success",
          isCheckedIn ? "You have checked out." : "You have checked in."
        );
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to check in/out."
        );
      }
    } catch (error) {
      console.error("Error checking in/out:", error);
      Alert.alert("Error", "An error occurred.");
    } finally {
      setLoadingCheckInOut(false);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.centerText}>Care Nest</Text>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: profileImageUrl || "https://via.placeholder.com/50",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user ? user.name : "Guest"}</Text>
            <Pressable
              style={[
                styles.signInButton,
                { backgroundColor: isCheckedIn ? "red" : "green" },
              ]}
              onPress={handleCheckIn}
              disabled={loadingCheckInOut}
            >
              {loadingCheckInOut ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signInButtonText}>
                  {isCheckedIn ? "Sign Out" : "Sign In"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <CurrentDateDisplay />

        <Link href="/notices" asChild>
          <Pressable>
            <Text style={styles.newsletterTitle}>Notice</Text>
            <View style={styles.newsletterBox}>
              {loadingNotices ? (
                <ActivityIndicator size="small" color="purple" />
              ) : notices.length > 0 ? (
                notices.map((notice) => (
                  <Text key={notice._id} style={styles.newsText}>
                    • {notice.message}
                  </Text>
                ))
              ) : (
                <Text style={styles.newsText}>No notices available.</Text>
              )}
            </View>
          </Pressable>
        </Link>

        <Text style={styles.sectionTitle}>What are you looking for</Text>
        <View style={styles.optionsContainer}>
          <Link href="/profile" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="person" size={30} color="black" />
              <Text style={styles.optionText}>Profile</Text>
            </Pressable>
          </Link>
          <Link replace href="/childDetail" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="person-circle" size={30} color="black" />
              <Text style={styles.optionText}>Children detail</Text>
            </Pressable>
          </Link>
          <Link replace href="/foodLog" asChild>
            <Pressable style={styles.optionButton}>
              <Ionicons name="fast-food" size={30} color="black" />
              <Text style={styles.optionText}>Meal</Text>
            </Pressable>
          </Link>

          <Pressable style={styles.optionButton2}>
            <Ionicons name="calendar" size={30} color="black" />
            <Text style={styles.optionText}>Attentance</Text>
          </Pressable>
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
