import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About Our App</Text>
      
      <Text style={styles.paragraph}>
        <Text style={styles.boldText}>Welcome to CARENEST!</Text>  
        Our app is designed to help orphanage communities manage daily operations efficiently and with ease. 
        From keeping track of children's records to managing staff and resources, our goal is to provide a 
        seamless and user-friendly experience.
      </Text>

      <Text style={styles.subTitle}>Our Mission</Text>
      <Text style={styles.paragraph}>
        We believe every child deserves love, care, and a well-organized environment to grow. This app helps orphanages:
      </Text>
      <Text style={styles.listItem}>✅ Maintain children's profiles (age, health, education, and more).</Text>
      <Text style={styles.listItem}>✅ Track attendance and activities.</Text>
      <Text style={styles.listItem}>✅ Manage staff and volunteers.</Text>
      <Text style={styles.listItem}>✅ Keep records of donations and resources.</Text>

      {/* <Text style={styles.subTitle}>Why Use Our App?</Text>
      <Text style={styles.listItem}>- **Easy to Use** 🏡 – Simple and intuitive design.</Text>
      <Text style={styles.listItem}>- **Secure & Reliable** 🔒 – Ensures data privacy and safety.</Text>
      <Text style={styles.listItem}>- **Improves Efficiency** 📊 – Reduces paperwork and manual tracking.</Text>
      <Text style={styles.listItem}>- **Real-time Updates** 📢 – Get instant access to important information.</Text> */}

      <Text style={styles.subTitle}>Join Us in Making a Difference!</Text>
      <Text style={styles.paragraph}>
        Together, we can create a better future for orphaned children by ensuring smooth operations in orphanages. 
        Thank you for being a part of this mission! 
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A148C',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  listItem: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    marginBottom: 5,
  },
});

export default AboutScreen;