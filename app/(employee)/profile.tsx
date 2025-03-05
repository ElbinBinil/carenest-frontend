import { StyleSheet, Image, View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios"; // Import axios
import { API_ENDPOINTS } from "../apiConfig"; // Import your API config

interface User {
  name: string;
  email: string;
  role: string;
  profileImage: string;
  uniqueIdNumber: string;
  phone_no: string;
  orphanageLocation: string;
}

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    async function fetchProfileImage() {
      if (user && user.profileImage) {
        try {
          const token = await AsyncStorage.getItem("authToken");
          if (!token) {
            Alert.alert("Error", "Authentication token missing.");
            return;
          }

          const response = await axios.post(
            API_ENDPOINTS.GET_FILE, // Use your API endpoint
            { objectUrl: user.profileImage },
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
      }
    }
    fetchProfileImage();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("authToken");
              await AsyncStorage.removeItem("refreshToken");
              router.replace("/signin");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Logout Failed", "An error occurred during logout.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: profileImageUrl || "https://via.placeholder.com/50" }} // Use fetched URL or placeholder
        style={styles.profileImage}
      />

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={24} color="#333" />
          <Text style={styles.infoText}>{user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="id-card" size={24} color="#333" />
          <Text style={styles.infoText}>{user?.uniqueIdNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="phone-portrait" size={24} color="#333" />
          <Text style={styles.infoText}>{user?.phone_no}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail" size={24} color="#333" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={24} color="#333" />
          <Text style={styles.infoText}>{user?.orphanageLocation}</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.editButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 39,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: "center",
    marginVertical: 20,
  },
  infoContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 26,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  infoText: {
    marginLeft: 20,
    fontSize: 17,
    color: "#333",
  },

  editButtonText: {
    fontSize: 16,
    color: "#eee",
    fontWeight: "bold",
  },
  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#F5F5F5",
  },
  tabItem: {
    alignItems: "center",
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: "rgb(219, 18, 28)",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
});
