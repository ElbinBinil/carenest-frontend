import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../apiConfig";

export default function AdminNotificationScreen() {
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const handleSave = async () => {
    if (notification.trim() === "") {
      Alert.alert("Error", "Please enter a notice.");
      return;
    }

    setIsLoading(true); // Set isLoading to true before request

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.ADD_NOTICE,
        { message: notification },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Notice added successfully!");
        setNotification(""); // Clear input after successful save
      } else {
        Alert.alert("Error", response.data.message || "Failed to add notice.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsLoading(false); // Set isLoading to false after request
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Notice</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter notice here..."
        value={notification}
        onChangeText={setNotification}
        multiline
        numberOfLines={5}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]} // Apply disabled style
        onPress={handleSave}
        disabled={isLoading} // Disable button when loading
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" /> // Show loading indicator
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", marginTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ea",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    textAlignVertical: "top",
    height: 150,
  },
  button: {
    backgroundColor: "#6200ea",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: {
    backgroundColor: "#ccc", // Grey out button when disabled
  },
});
