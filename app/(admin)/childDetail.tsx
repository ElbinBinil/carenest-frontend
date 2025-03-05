import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { API_ENDPOINTS } from "../apiConfig";

interface Child {
  _id: string;
  name: string;
  dob: string;
  educationLevel: string;
  gender: string;
  profileImage: string;
}

export default function ChildDetail() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [profileImageUrls, setProfileImageUrls] = useState<
    Record<string, string>
  >({});

  const fetchChildren = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const user = await AsyncStorage.getItem("user");

      if (!token || !user) {
        setError("Authentication token or user data missing.");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(user);
      const orphanageLocation = parsedUser.orphanageLocation;

      const response = await axios.get(API_ENDPOINTS.ADMIN_CHILDREN, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setChildren(response.data.data.children);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch children.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching children.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchChildren();
  }, [fetchChildren]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChildren();
  }, [fetchChildren]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchProfileImage = useCallback(
    async (childId: string, objectUrl: string) => {
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
          setProfileImageUrls((prev) => ({
            ...prev,
            [childId]: response.data.signedUrl,
          }));
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
    },
    []
  );

  useEffect(() => {
    children.forEach((child) => {
      if (child.profileImage) {
        fetchProfileImage(child._id, child.profileImage);
      }
    });
  }, [children, fetchProfileImage]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text>Loading children...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Child-Details</Text>
        <FlatList
          data={children}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.childCard}>
              {item.profileImage && (
                <Image
                  source={{
                    uri:
                      profileImageUrls[item._id] ||
                      "https://via.placeholder.com/50",
                  }}
                  style={styles.profileImage}
                />
              )}
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={styles.childDetails}>
                  DOB: {formatDate(item.dob)} • Level: {item.educationLevel} •
                  Gender: {item.gender}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Link href="/addChild" asChild>
          <Pressable style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#6200ea",
  },
  childCard: {
    flexDirection: "row",
    backgroundColor: "#EDE0F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C",
  },
  childDetails: {
    fontSize: 14,
    color: "#666",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#6200ea",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  childInfo: {
    flex: 1,
  },
});
