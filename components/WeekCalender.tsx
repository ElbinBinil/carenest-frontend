import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

const CurrentDateDisplay = () => {
  const today = new Date();

  // Get date components
  const day = today.getDate(); // 22
  const month = today.toLocaleString("en-US", { month: "long" }).toUpperCase(); // SEPTEMBER
  const year = today.getFullYear(); // 2025
  const weekday = today
    .toLocaleString("en-US", { weekday: "long" })
    .toUpperCase(); // MONDAY

  // Get current hour
  const hour = today.getHours();

  // Determine greeting
  let greeting = "";
  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon ☀️";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening 🌆";
  } else {
    greeting = "Good Night 🌙";
  }

  return (
    <>
      {/* <ImageBackground
        source={require("@/assets/images/startscreen.png")}
        resizeMode="cover"
        style={styles.image}
      > */}
        <View style={styles.container}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{`${day} ${month} ${year}`}</Text>
          {/* <Text style={styles.dayText}>{weekday}</Text> */}
        </View>
      {/* </ImageBackground> */}
    </>
  );
};

export default CurrentDateDisplay;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    // backgroundColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "purple",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  dayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "purple",
  },
  image: {
    borderRadius: 20,
    overflow: "hidden", // Add this line
    opacity: 0.5,
    resizeMode: "cover",
    justifyContent: "center",
    width: "100%",
    //height: 200, // or whatever height you want
  },
});
