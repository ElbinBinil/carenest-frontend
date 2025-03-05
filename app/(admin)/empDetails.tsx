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

interface Employee {
  _id: string;
  uniqueIdNumber: string;
  name: string;
  email: string;
  phone_no: number;
  profileImage: string;
  role: string;
  orphanageLocation: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  fcmToken: string;
}

export default function EmployeeDetail() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [profileImageUrls, setProfileImageUrls] = useState<
    Record<string, string>
  >({});

  const fetchEmployees = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.GET_EMP, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setEmployees(response.data.employees); // Access employees array directly
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch employees.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching employees.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEmployees();
  }, [fetchEmployees]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees();
  }, [fetchEmployees]);

  const fetchProfileImage = useCallback(
    async (employeeId: string, objectUrl: string) => {
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
            [employeeId]: response.data.signedUrl,
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
    employees.forEach((employee) => {
      if (employee.profileImage) {
        fetchProfileImage(employee._id, employee.profileImage);
      }
    });
  }, [employees, fetchProfileImage]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text>Loading employees...</Text>
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
        <Text style={styles.header}>Employee-Details</Text>
        <FlatList
          data={employees}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.employeeCard}>
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
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{item.name}</Text>
                <Text style={styles.employeeDetails}>
                  Email: {item.email} • Phone: {item.phone_no} • Role:{" "}
                  {item.role}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Link href="/addEmployee" asChild>
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
  employeeCard: {
    flexDirection: "row",
    backgroundColor: "#EDE0F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C",
  },
  employeeDetails: {
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
  employeeInfo: {
    flex: 1,
  },
});
