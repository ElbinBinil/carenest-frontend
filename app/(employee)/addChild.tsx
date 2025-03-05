import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import FormData from "form-data";
const PlaceholderImage = require("@/assets/images/placeholder.jpg");
import { API_ENDPOINTS } from "../apiConfig";

const AddChildScreen = () => {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [orphanageLocation, setOrphanageLocation] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [disability, setDisability] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  const handleSubmit = async () => {
    if (!name || !dob || !gender || !orphanageLocation) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true); // Set isLoading to true before making the request

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("orphanageLocation", orphanageLocation);
      formData.append("educationLevel", educationLevel);
      formData.append("disability", disability);

      if (image) {
        const fileInfo = await FileSystem.getInfoAsync(image);
        if (fileInfo.exists) {
          const fileName = image.split("/").pop();
          formData.append("profileImage", {
            uri: image,
            name: fileName,
            type: "image/jpeg",
          });
        }
      }

      const response = await axios.post(API_ENDPOINTS.ADD_CHILD, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Child added successfully!");
        setName("");
        setDob("");
        setGender("");
        setOrphanageLocation("");
        setEducationLevel("");
        setDisability("");
        setImage(undefined);
      } else {
        Alert.alert("Error", response.data.message || "Failed to add child.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsLoading(false); // Set isLoading to false after the request completes
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Add New Child</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <ImageViewer imgSource={PlaceholderImage} selectedImage={image} />
          </View>
          <View style={styles.footerContainer}>
            <Button
              theme="primary"
              label="Choose a photo"
              onPress={pickImageAsync}
            />
            <Button label="Use this photo" />
          </View>
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="DOB (DD/MM/YYYY)"
            style={styles.input}
            value={dob}
            onChangeText={setDob}
          />

          <View style={styles.dropdown}>
            <RNPickerSelect
              onValueChange={setGender}
              items={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              placeholder={{ label: "Select Gender", value: "" }}
              value={gender}
              style={pickerSelectStyles}
            />
          </View>

          <View style={styles.dropdown}>
            <RNPickerSelect
              onValueChange={setOrphanageLocation}
              items={[
                { label: "Main Location", value: "Main Location" },
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5", value: "5" },
              ]}
              placeholder={{ label: "Select Location", value: "" }}
              value={orphanageLocation}
              style={pickerSelectStyles}
            />
          </View>

          <TextInput
            placeholder="Education Level"
            style={styles.input}
            value={educationLevel}
            onChangeText={setEducationLevel}
          />
          <TextInput
            placeholder="Disability (if any)"
            style={styles.input}
            value={disability}
            onChangeText={setDisability}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && { backgroundColor: "#ccc" }, // Disable button style
            ]}
            onPress={handleSubmit}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" /> // Show loading indicator
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1, marginTop: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 20,
  },
  imagePicker: { alignItems: "center", marginBottom: 10 },
  image: { width: 100, height: 100, borderRadius: 30 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#6a0dad",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 16 },
  imageContainer: {
    alignItems: "center",
    borderRadius: 20,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 18,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
};

export default AddChildScreen;
