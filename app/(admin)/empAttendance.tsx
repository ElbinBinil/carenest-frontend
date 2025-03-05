import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";

interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  orphanageLocation: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function EmployeeAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrls, setProfileImageUrls] = useState<
    Record<string, string>
  >({});

  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.EMP_ATTENDANCE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAttendanceRecords(response.data.data);
        setError(null);
      } else {
        setError(
          response.data.message || "Failed to fetch attendance records."
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching attendance records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

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
    attendanceRecords.forEach((record) => {
      if (record.employeeId.profileImage) {
        fetchProfileImage(
          record.employeeId._id,
          record.employeeId.profileImage
        );
      }
    });
  }, [attendanceRecords, fetchProfileImage]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6200ea" />
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

  const groupedRecords = attendanceRecords.reduce((groups, record) => {
    const date = formatDate(record.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, AttendanceRecord[]>);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Employee Attendance</Text>
        {Object.entries(groupedRecords).map(([date, records]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}:</Text>
            <FlatList
              data={records}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.recordCard}>
                  <Image
                    source={{
                      uri:
                        profileImageUrls[item.employeeId._id] ||
                        "https://via.placeholder.com/50",
                    }}
                    style={styles.profileImage}
                  />
                  <View style={styles.recordDetails}>
                    <Text style={styles.employeeName}>
                      {item.employeeId.name}
                    </Text>
                    <Text style={styles.recordText}>
                      Check-in: {formatTime(item.checkInTime)}
                    </Text>
                    <Text style={styles.recordText}>
                      Check-out: {formatTime(item.checkOutTime)}
                    </Text>
                    <Text
                      style={[
                        styles.recordText,
                        {
                          backgroundColor:
                            item.status === "On Time" ? "green" : "red",
                          color: "white",
                          padding: 5,
                          borderRadius: 5,
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      Status: {item.status}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        ))}
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
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  recordCard: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  recordDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  recordText: {
    fontSize: 16,
    marginBottom: 3,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
