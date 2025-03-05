import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Checkbox } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../apiConfig";

interface Child {
  _id: string;
  name: string;
  dob: string;
  orphanageLocation: string;
}

interface User {
  orphanageLocation: string;
}

export default function ChildList() {
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        setUserLocation(parsedUser.orphanageLocation);
      }
    } catch (err: any) {
      setError("Error fetching user data.");
    }
  }, []);

  const fetchChildren = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        API_ENDPOINTS.ADMIN_CHILDREN,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setChildrenData(response.data.data.children);
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
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    setLoading(true);
    fetchChildren();
  }, [fetchChildren]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChildren();
  }, [fetchChildren]);

  const handleCheckboxToggle = (id: string) => {
    setSelectedValues((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.CHILD_LOG,
        {
          absentees: selectedValues,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Child log submitted successfully!");
        setSelectedValues([]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to submit child log."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "An error occurred during submission."
      );
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading children...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredChildren = childrenData.filter(
    (child) => child.orphanageLocation === userLocation
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Child-Log</Text>

      <FlatList
        data={filteredChildren}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.childCard}>
            <View>
              <Text style={styles.childName}>{item.name}</Text>
              <Text style={styles.childDetails}>
                Age: {calculateAge(item.dob)}
              </Text>
            </View>
            <Checkbox
              status={
                selectedValues.includes(item._id) ? "checked" : "unchecked"
              }
              onPress={() => handleCheckboxToggle(item._id)}
              color="#6200ea"
            />
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDE0F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
  submitButton: {
    backgroundColor: "#6200ea",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
