import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import FormData from "form-data";
import { API_ENDPOINTS } from "../apiConfig";

const MealLoggerScreen = () => {
  const [selectedMeal, setSelectedMeal] = useState("");
  const [servings, setServings] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to take a picture."
        );
      }
    })();
  }, []);

  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedMeal || !servings || !capturedImage) {
      Alert.alert("Error", "Please fill in all fields and capture an image.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      const user = await AsyncStorage.getItem("user");

      if (!token || !user) {
        Alert.alert("Error", "Authentication token or user data missing.");
        return;
      }

      const parsedUser = JSON.parse(user);
      const orphanageLocation = parsedUser.orphanageLocation;

      const formData = new FormData();
      formData.append("mealType", selectedMeal);
      formData.append("orphanageLocation", orphanageLocation);
      formData.append("servings", servings);

      const fileInfo = await FileSystem.getInfoAsync(capturedImage);
      if (fileInfo.exists) {
        const fileName = capturedImage.split("/").pop();
        formData.append("foodImage", {
          uri: capturedImage,
          name: fileName,
          type: "image/jpeg",
        });
      }

      const response = await axios.post(API_ENDPOINTS.FOOD_ADD, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Meal log saved successfully!");
        setSelectedMeal("");
        setServings("");
        setCapturedImage(null);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to save meal log."
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>🍽️ Meal Log</Text>

      <Text style={styles.label}>Meal Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedMeal}
          onValueChange={setSelectedMeal}
          style={styles.picker}
        >
          <Picker.Item label="Select Meal" value="" />
          <Picker.Item label="Breakfast" value="Breakfast" />
          <Picker.Item label="Lunch" value="Lunch" />
          <Picker.Item label="Dinner" value="Dinner" />
          <Picker.Item label="Snacks" value="Snacks" />
        </Picker>
      </View>

      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
      )}

      <Text style={styles.label}>Photo</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={openCamera}>
        <Text style={styles.uploadText}>📷 Capture Image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Number of Servings</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter servings"
        value={servings}
        onChangeText={setServings}
      />

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.disabledButton]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveText}>💾 Save Daily Meal Log</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MealLoggerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white", marginTop: 20 },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "purple",
    marginBottom: 10,
  },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10, color: "black" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: { height: 50, width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  uploadButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  uploadText: { fontSize: 16, fontWeight: "bold" },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  saveButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
  disabledButton: {
    backgroundColor: "#666",
  },
});
