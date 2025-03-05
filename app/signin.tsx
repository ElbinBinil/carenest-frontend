import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_ENDPOINTS } from "./apiConfig";

export default function SigninPage() {
  const [uniqueIdNumber, setUniqueIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!uniqueIdNumber || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.SIGNIN, {
        uniqueIdNumber,
        password,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Store access token and refresh token
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        // Store user details
        await AsyncStorage.setItem("user", JSON.stringify(user));
        console.log(user.role);

        //Token checks
        const token = await AsyncStorage.getItem("user");
        if (token) {
          const parsedToken = JSON.parse(token);
          console.log(parsedToken.role);
        }

        Alert.alert("Login Successful", `Welcome, ${user.name}!`);
        if (user.role === "admin") {
          router.replace("/(admin)");
        } else if (user.role === "Employee") {
          router.replace("/(employee)");
        } else {
          router.replace("/"); // Or any default route
        }
      } else {
        Alert.alert("Login Failed", response.data.message || "Unknown error");
      }
    } catch (error: any) {
      console.log(error);
      let errorMessage = "Something went wrong";

      if (error.response) {
        // Check if the response is HTML (like your error message)
        if (
          typeof error.response.data === "string" &&
          error.response.data.includes("Password is incorrect")
        ) {
          errorMessage = "Password is incorrect!";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/trust.jpg")}
        style={styles.imagestyle}
      />
      {/* <Text  style={styles.subtitle} >Welcome to Orphan Track</Text> */}

      <View style={styles.container2}>
        <Text style={styles.signInText}>SIGN IN</Text>
        <View style={styles.inputContainer}>
          <Text>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={uniqueIdNumber}
            onChangeText={setUniqueIdNumber}
          />
          <Text>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 50,
    fontSize: 14,
    color: "#333",
  },
  signInText: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 30,
  },
  container2: {
    // backgroundColor: "white",
    width: "94%",
    margin: 90,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    // borderColor: "#ccc",
    padding: 15,
    marginBottom: 90,
  },
  inputContainer: {
    width: "97%",
    marginTop: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 25,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#000",
    width: "97%",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 50,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#0066cc",
    margin: 8,
    textDecorationLine: "underline",
  },

  imagestyle: {
    width: 220,
    height: 60,
    marginTop: 40,
  },
});
