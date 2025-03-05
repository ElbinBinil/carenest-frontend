import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { API_ENDPOINTS } from "../apiConfig";

interface FoodLog {
  _id: string;
  mealType: string;
  foodPhoto: string;
  servings: number;
  loggedBy: {
    _id: string;
    name: string;
    email: string;
  };
  orphanageLocation: string;
  timeLogged: string;
}

export default function FoodLogDetail() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [foodImageUrls, setFoodImageUrls] = useState<Record<string, string>>(
    {}
  );

  const fetchFoodLogs = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.FOOD_LOG, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setFoodLogs(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch food logs.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching food logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFoodLogs();
  }, [fetchFoodLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodLogs();
  }, [fetchFoodLogs]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchFoodImage = useCallback(
    async (foodLogId: string, objectUrl: string) => {
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
          setFoodImageUrls((prev) => ({
            ...prev,
            [foodLogId]: response.data.signedUrl,
          }));
        } else {
          Alert.alert(
            "Error",
            response.data.message || "Failed to fetch food image."
          );
        }
      } catch (error) {
        console.error("Error fetching food image:", error);
        Alert.alert("Error", "Failed to fetch food image.");
      }
    },
    []
  );

  useEffect(() => {
    foodLogs.forEach((foodLog) => {
      if (foodLog.foodPhoto) {
        fetchFoodImage(foodLog._id, foodLog.foodPhoto);
      }
    });
  }, [foodLogs, fetchFoodImage]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text>Loading food logs...</Text>
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
        <Text style={styles.header}>Food-Log-Details</Text>
        <FlatList
          data={foodLogs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.foodLogCard}>
              <Image
                source={{
                  uri:
                    foodImageUrls[item._id] || "https://via.placeholder.com/80",
                }}
                style={styles.foodImage}
              />
              <View style={styles.foodLogInfo}>
                <Text style={styles.foodLogMessage}>
                  Meal Type: {item.mealType}
                </Text>
                <Text style={styles.foodLogDetails}>
                  Servings: {item.servings || 1}
                </Text>
                <Text style={styles.foodLogDetails}>
                  Logged By: {item.loggedBy.name}
                </Text>
                <Text style={styles.foodLogDetails}>
                  Time Logged: {formatDate(item.timeLogged)}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
  foodLogCard: {
    flexDirection: "row",
    backgroundColor: "#EDE0F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  foodLogMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C",
  },
  foodLogDetails: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  foodLogInfo: {
    flex: 1,
    marginLeft: 10,
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
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});
