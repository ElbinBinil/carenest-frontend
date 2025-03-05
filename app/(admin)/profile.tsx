import {
  StyleSheet,
  Image,
  Platform,
  View,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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
              // Clear other relevant AsyncStorage items if necessary
              router.replace("/signin"); // Navigate to the sign-in screen
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
        source={{ uri: user?.profileImage }} // Replace with user's profile image URL
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
    marginTop: 20,
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
    color: "#333",
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
    backgroundColor: "rgb(250, 19, 31)",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
});
